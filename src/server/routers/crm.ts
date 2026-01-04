import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { createWorkflowEngine } from '@/lib/workflows'
import { checkBlockingActivities, ensureOpenActivity } from '@/lib/utils/activity-system'
import { historyService } from '@/lib/services'

// Type for campaign sequence step structure
interface SequenceStep {
  stepNumber?: number
  subject?: string
  templateId?: string
  templateName?: string
  dayOffset?: number
}

// Type for campaign channel data in sequences JSONB
interface ChannelSequenceData {
  steps?: SequenceStep[]
}

// ============================================
// CRM ROUTER - Accounts, Leads, Deals, Contacts
// ============================================

export const crmRouter = router({
  // ============================================
  // ACCOUNTS
  // ============================================
  accounts: router({
    // List accounts with filtering and sorting
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['active', 'inactive', 'prospect', 'on_hold', 'all']).default('all'),
        type: z.enum(['enterprise', 'mid_market', 'smb', 'startup']).optional(),
        industry: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['name', 'industry', 'type', 'status', 'jobs_count', 'placements_count', 'owner_id', 'last_contact_date', 'created_at']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('companies')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)', { count: 'exact' })
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`name.ilike.%${input.search}%,industry.ilike.%${input.search}%`)
        }
        if (input.status && input.status !== 'all') {
          query = query.eq('status', input.status)
        }
        if (input.type) {
          query = query.eq('segment', input.type)
        }
        if (input.industry) {
          query = query.eq('industry', input.industry)
        }
        if (input.ownerId) {
          query = query.eq('owner_id', input.ownerId)
        }

        // Apply sorting
        query = query.order(input.sortBy, { ascending: input.sortOrder === 'asc' })
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
            type: a.segment,
            company_type: a.segment,
            website: a.website,
            phone: a.phone,
            address: null, // Legacy field - use addresses table
            city: a.headquarters_city,
            state: a.headquarters_state,
            country: a.headquarters_country,
            tier: a.tier,
            owner: a.owner,
            lastContactDate: a.last_contacted_date,
            last_contact_date: a.last_contacted_date,
            createdAt: a.created_at,
            created_at: a.created_at,
          })) ?? [],
          total: count ?? 0,
        }
      }),

    // Get account by ID - returns account core data only (no nested relations)
    // Use this for full account details on detail page
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data: account, error } = await adminClient
          .from('companies')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url), client_details:company_client_details(*)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' })
        }

        // Fetch addresses separately
        const { data: addresses } = await adminClient
          .from('addresses')
          .select('*')
          .eq('entity_type', 'account')
          .eq('entity_id', input.id)

        // Fetch primary contact separately
        const { data: primaryContact } = await adminClient
          .from('contacts')
          .select('id, first_name, last_name, email, phone, title')
          .eq('company_id', input.id)
          .eq('is_primary', true)
          .maybeSingle()

        // Transform addresses to match old structure for backward compatibility
        const addressList = addresses || []
        const headquartersAddress = addressList.find((a: { address_type: string }) => a.address_type === 'headquarters')
        const billingAddress = addressList.find((a: { address_type: string }) => a.address_type === 'billing')

        // Extract client_details for flattening
        const clientDetails = Array.isArray(account.client_details) 
          ? account.client_details[0] 
          : account.client_details

        return {
          ...account,
          // Legacy fields for backward compatibility
          headquarters_location: headquartersAddress?.address_line_1 || null,
          headquarters_city: headquartersAddress?.city || account.headquarters_city || null,
          headquarters_state: headquartersAddress?.state_province || account.headquarters_state || null,
          headquarters_country: headquartersAddress?.country_code || account.headquarters_country || 'US',
          headquarters_postal_code: headquartersAddress?.postal_code || null,
          // Billing fields from addresses
          billing_address: billingAddress?.address_line_1 || null,
          billing_city: billingAddress?.city || null,
          billing_state: billingAddress?.state_province || null,
          billing_postal_code: billingAddress?.postal_code || null,
          billing_country: billingAddress?.country_code || 'US',
          // Billing fields from client_details
          billing_entity_name: clientDetails?.billing_entity_name || null,
          billing_email: clientDetails?.billing_email || null,
          billing_phone: clientDetails?.billing_phone || null,
          billing_frequency: clientDetails?.billing_frequency || null,
          po_required: clientDetails?.po_required || false,
          payment_terms_days: clientDetails?.payment_terms_days || null,
          // Primary contact fields
          primary_contact_id: primaryContact?.id || null,
          primary_contact_name: primaryContact ? `${primaryContact.first_name} ${primaryContact.last_name}`.trim() : null,
          primary_contact_email: primaryContact?.email || null,
          primary_contact_title: primaryContact?.title || null,
          primary_contact_phone: primaryContact?.phone || null,
        }
      }),

    // Get account by ID - lightweight version for server layout/navigation
    // Returns minimal fields needed for header display
    getByIdLite: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('companies')
          .select('id, name, industry, status, website, phone, headquarters_city, headquarters_state')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Account not found' })
        }

        // Map to legacy column names for backward compatibility
        return {
          ...data,
          city: data.headquarters_city,
          state: data.headquarters_state,
        }
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
          .from('companies')
          .select(`
            id, name, industry, status, last_contacted_date, nps_score,
            jobs:jobs!company_id(id, status),
            placements:placements!company_id(id, billing_rate, hours_billed)
          `)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .eq('owner_id', ownerId)
          .is('deleted_at', null)
          .order('name')

        const now = new Date()
        const results = accounts?.map(account => {
          // Calculate health score
          const lastContact = account.last_contacted_date ? new Date(account.last_contacted_date) : null
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
            lastContactDate: account.last_contacted_date,
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
          .from('companies')
          .select(`
            id, name, industry, status, last_contacted_date, nps_score,
            jobs:jobs!company_id(id, status)
          `)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .eq('owner_id', user?.id)
          .is('deleted_at', null)
          .order('last_contacted_date', { ascending: false, nullsFirst: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data?.map(a => ({
          id: a.id,
          name: a.name,
          industry: a.industry,
          status: a.status,
          lastContactDate: a.last_contacted_date,
          npsScore: a.nps_score,
          activeJobs: (a.jobs as Array<{ status: string }> | null)?.filter(j => j.status === 'active').length ?? 0,
        })) ?? []
      }),

    // Create new account
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(2).max(200),
        industry: z.string().optional(),
        industries: z.array(z.string()).optional(), // Array of industries
        companyType: z.enum(['direct_client', 'implementation_partner', 'staffing_vendor']).default('direct_client'),
        status: z.enum(['prospect', 'active', 'inactive']).default('prospect'),
        tier: z.enum(['preferred', 'strategic', 'exclusive']).optional(),
        segment: z.enum(['enterprise', 'mid_market', 'smb', 'startup']).optional(),
        website: z.string().url().optional().or(z.literal('')),
        phone: z.string().optional(),
        // Headquarters location - separate fields
        headquartersLocation: z.string().optional(), // Legacy combined string
        headquartersCity: z.string().optional(),
        headquartersState: z.string().optional(),
        headquartersCountry: z.string().optional(),
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

        // Check for duplicate account name before creating
        const { data: existingAccount } = await adminClient
          .from('companies')
          .select('id, name')
          .eq('org_id', orgId)
          .eq('name', input.name.trim())
          .is('deleted_at', null)
          .maybeSingle()

        if (existingAccount) {
          throw new TRPCError({ 
            code: 'CONFLICT', 
            message: `An account with the name "${input.name}" already exists. Please use a different name.` 
          })
        }

        // Determine category based on status
        const category = input.status === 'prospect' ? 'prospect' : 'client'

        // Get the user_profile.id for the current user (needed for FK constraints)
        // The auth user.id is from auth.users, but owner_id references user_profiles.id
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

        // Log industries array for debugging
        console.log('[Account Create] Industries received:', input.industries)

        // Create company record
        const { data: account, error } = await adminClient
          .from('companies')
          .insert({
            org_id: orgId,
            category: category,
            name: input.name,
            industry: input.industry || (input.industries?.length ? input.industries[0] : undefined),
            industries: input.industries?.length ? input.industries : null,
            segment: input.segment || null,
            relationship_type: input.companyType === 'implementation_partner' ? 'implementation_partner' :
                               input.companyType === 'staffing_vendor' ? 'prime_vendor' : 'direct_client',
            status: input.status === 'prospect' ? 'active' : input.status,
            tier: input.tier === 'preferred' ? 'preferred' :
                  input.tier === 'strategic' ? 'strategic' :
                  input.tier === 'exclusive' ? 'strategic' : 'standard',
            website: input.website || null,
            phone: input.phone,
            description: input.description,
            annual_revenue: input.annualRevenueTarget,
            // Headquarters location - stored in separate columns
            headquarters_city: input.headquartersCity || null,
            headquarters_state: input.headquartersState || null,
            headquarters_country: input.headquartersCountry || 'US',
            // Communication
            preferred_contact_method: input.preferredContactMethod,
            meeting_cadence: input.meetingCadence,
            // Company
            legal_name: input.legalName,
            employee_count: input.employeeCount,
            linkedin_url: input.linkedinUrl || null,
            founded_year: input.foundedYear,
            // Payment
            default_payment_terms: input.paymentTermsDays ? `Net ${input.paymentTermsDays}` : 'Net 30',
            requires_po: input.poRequired,
            // Ownership
            owner_id: userProfileId,
            account_manager_id: userProfileId,
            onboarding_status: 'pending',
            created_by: userProfileId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Always create client_details record to store billing frequency and other settings
        const { error: clientDetailsError } = await adminClient
          .from('company_client_details')
          .insert({
            company_id: account.id,
            org_id: orgId,
            billing_entity_name: input.billingEntityName || null,
            billing_email: input.billingEmail || null,
            billing_phone: input.billingPhone || null,
            billing_frequency: input.billingFrequency || 'monthly',
            po_required: input.poRequired || false,
            billing_address_line_1: input.billingAddress || null,
            billing_city: input.billingCity || null,
            billing_state: input.billingState || null,
            billing_postal_code: input.billingPostalCode || null,
            billing_country: input.billingCountry || 'US',
          })

        if (clientDetailsError) {
          console.error('[Account Create] Failed to create client_details:', clientDetailsError)
        }

        // Create addresses if provided
        const addressInserts = []

        // Headquarters address - use separate city/state/country fields
        if (input.headquartersCity || input.headquartersState || input.headquartersLocation) {
          addressInserts.push({
            org_id: orgId,
            entity_type: 'account',
            entity_id: account.id,
            address_type: 'headquarters',
            address_line_1: input.headquartersLocation || null,
            city: input.headquartersCity || null,
            state_province: input.headquartersState || null,
            country_code: input.headquartersCountry === 'USA' ? 'US' : (input.headquartersCountry || 'US'),
            is_primary: true,
            created_by: userProfileId,
          })
        }

        // Billing address
        if (input.billingAddress || input.billingCity || input.billingState || input.billingPostalCode) {
          addressInserts.push({
            org_id: orgId,
            entity_type: 'account',
            entity_id: account.id,
            address_type: 'billing',
            address_line_1: input.billingAddress || null,
            city: input.billingCity || null,
            state_province: input.billingState || null,
            postal_code: input.billingPostalCode || null,
            country_code: input.billingCountry === 'USA' ? 'US' : (input.billingCountry || 'US'),
            is_primary: false,
            created_by: userProfileId,
          })
        }

        if (addressInserts.length > 0) {
          const { error: addressError } = await adminClient
            .from('addresses')
            .insert(addressInserts)

          if (addressError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Failed to create addresses: ${addressError.message}` })
          }
        }

        // Create primary contact if name OR email provided (not requiring both)
        if (input.primaryContactEmail || input.primaryContactName) {
          // Parse name into first/last if provided
          let firstName = ''
          let lastName = ''
          if (input.primaryContactName) {
            const nameParts = input.primaryContactName.split(' ')
            firstName = nameParts[0] || ''
            lastName = nameParts.slice(1).join(' ') || ''
          }

          const { error: contactError } = await adminClient
            .from('contacts')
            .insert({
              org_id: orgId,
              company_id: account.id,
              category: 'person',  // Required field
              subtype: 'person_client_contact',  // Must match pattern for person category
              first_name: firstName || 'Primary',  // Default if no name provided
              last_name: lastName || 'Contact',
              email: input.primaryContactEmail || null,
              phone: input.primaryContactPhone || null,
              title: input.primaryContactTitle || null,
              is_primary: true,
              created_by: userProfileId,
            })

          if (contactError) {
            console.error('[Account Create] Failed to create contact:', contactError)
          }
        }

        // Record history: Account created
        void historyService.recordEntityCreated(
          'account',
          account.id,
          { orgId, userId: user?.id ?? null },
          { entityName: input.name, initialStatus: input.status }
        ).catch(err => console.error('[History] Failed to record account creation:', err))

        return account
      }),

    // Update account
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(200).optional(),
        industry: z.string().optional(),
        industries: z.array(z.string()).optional(), // Array of industries
        companyType: z.enum(['direct_client', 'implementation_partner', 'staffing_vendor']).optional(),
        status: z.enum(['prospect', 'active', 'inactive']).optional(),
        tier: z.enum(['preferred', 'strategic', 'exclusive']).nullish(),
        segment: z.enum(['enterprise', 'mid_market', 'smb', 'startup']).nullish(),
        website: z.string().url().optional().or(z.literal('')),
        phone: z.string().optional(),
        headquartersLocation: z.string().optional(),
        headquartersCity: z.string().optional(),
        headquartersState: z.string().optional(),
        headquartersCountry: z.string().optional(),
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
        // Primary contact (optional)
        primaryContactName: z.string().optional(),
        primaryContactEmail: z.string().email().optional(),
        primaryContactTitle: z.string().optional(),
        primaryContactPhone: z.string().optional(),
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

        // Get the user_profile.id for the current user (needed for FK constraints)
        // The auth user.id is from auth.users, but updated_by references user_profiles.id
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

        // HISTORY: Fetch current state BEFORE update for change detection
        const { data: beforeSnapshot } = await adminClient
          .from('companies')
          .select('*')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        // GUIDEWIRE PATTERN: Check for blocking activities before status change to closing statuses
        if (input.status && ['inactive', 'closed', 'churned', 'lost'].includes(input.status)) {
          // Get current account to compare status
          const { data: currentAccount } = await adminClient
            .from('companies')
            .select('status')
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single()

          // Only check blocking if status is actually changing
          if (currentAccount && currentAccount.status !== input.status) {
            // Check for blocking activities
            const { data: blockingActivities } = await adminClient
              .from('activities')
              .select(`
                id,
                subject,
                status,
                priority,
                due_date,
                assigned_to,
                user_profiles!activities_assigned_to_fkey (id, first_name, last_name)
              `)
              .eq('org_id', orgId)
              .eq('entity_type', 'account')
              .eq('entity_id', input.id)
              .in('status', ['open', 'in_progress', 'scheduled'])
              .eq('is_blocking', true)
              .is('deleted_at', null)

            if (blockingActivities && blockingActivities.length > 0) {
              throw new TRPCError({
                code: 'PRECONDITION_FAILED',
                message: `Cannot change status to "${input.status}": ${blockingActivities.length} blocking activit${blockingActivities.length === 1 ? 'y' : 'ies'} must be completed first`,
                cause: {
                  blockingActivities: blockingActivities.map(a => ({
                    id: a.id,
                    subject: a.subject,
                    status: a.status,
                    priority: a.priority,
                    dueDate: a.due_date,
                    assignedTo: a.user_profiles
                      ? {
                          id: (a.user_profiles as { id: string; first_name: string; last_name: string }).id,
                          firstName: (a.user_profiles as { id: string; first_name: string; last_name: string }).first_name,
                          lastName: (a.user_profiles as { id: string; first_name: string; last_name: string }).last_name,
                        }
                      : null,
                  })),
                },
              })
            }
          }
        }

        // Auto-create watchlist activity when account becomes active
        if (input.status === 'active') {
          const { data: currentAccount } = await adminClient
            .from('companies')
            .select('status, owner_id')
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single()

          // If transitioning to active from prospect, ensure there's an activity
          if (currentAccount && currentAccount.status === 'prospect') {
            // Check if there are any open activities
            const { count } = await adminClient
              .from('activities')
              .select('*', { count: 'exact', head: true })
              .eq('org_id', orgId)
              .eq('entity_type', 'account')
              .eq('entity_id', input.id)
              .in('status', ['open', 'in_progress', 'scheduled'])
              .is('deleted_at', null)

            // If no activities, create a watchlist activity
            if ((count ?? 0) === 0) {
              const dueDate = new Date()
              dueDate.setDate(dueDate.getDate() + 30)

              await adminClient.from('activities').insert({
                org_id: orgId,
                entity_type: 'account',
                entity_id: input.id,
                activity_type: 'task',
                subject: 'Watchlist',
                description: 'Auto-created: This account is now active and requires attention.',
                status: 'open',
                priority: 'low',
                due_date: dueDate.toISOString(),
                assigned_to: currentAccount.owner_id || userProfileId,
                pattern_code: 'sys_watchlist_account',
                auto_created: true,
                created_by: userProfileId,
              })
            }
          }
        }

        const updateData: Record<string, unknown> = {
          updated_by: userProfileId,
        }

        // Map input to database columns (companies table)
        if (input.name !== undefined) updateData.name = input.name
        if (input.industry !== undefined) updateData.industry = input.industry
        if (input.industries !== undefined) {
          updateData.industries = input.industries.length > 0 ? input.industries : null
          // Also set primary industry from first item if not explicitly set
          if (input.industry === undefined && input.industries.length > 0) {
            updateData.industry = input.industries[0]
          }
        }
        if (input.companyType !== undefined) {
          // Map companyType to relationship_type (the actual DB column)
          updateData.relationship_type = input.companyType === 'implementation_partner' ? 'implementation_partner' :
                                         input.companyType === 'staffing_vendor' ? 'prime_vendor' : 'direct_client'
        }
        if (input.segment !== undefined) {
          updateData.segment = input.segment
        }
        if (input.status !== undefined) updateData.status = input.status
        if (input.tier !== undefined) {
          updateData.tier = input.tier === 'preferred' ? 'preferred' :
                            input.tier === 'strategic' ? 'strategic' :
                            input.tier === 'exclusive' ? 'strategic' : 'standard'
        }
        if (input.website !== undefined) updateData.website = input.website || null
        if (input.phone !== undefined) updateData.phone = input.phone
        if (input.description !== undefined) updateData.description = input.description
        if (input.annualRevenueTarget !== undefined) updateData.annual_revenue = input.annualRevenueTarget
        // Payment terms
        if (input.paymentTermsDays !== undefined) updateData.default_payment_terms = `Net ${input.paymentTermsDays}`
        if (input.poRequired !== undefined) updateData.requires_po = input.poRequired
        // Communication
        if (input.preferredContactMethod !== undefined) updateData.preferred_contact_method = input.preferredContactMethod
        if (input.meetingCadence !== undefined) updateData.meeting_cadence = input.meetingCadence
        // Company
        if (input.legalName !== undefined) updateData.legal_name = input.legalName
        if (input.employeeCount !== undefined) updateData.employee_count = input.employeeCount
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
        if (input.relationshipHealth !== undefined) updateData.health_status = input.relationshipHealth

        const { data, error } = await adminClient
          .from('companies')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .select()
          .single()

        // Update client_details if billing fields provided
        if (input.billingEntityName !== undefined || input.billingEmail !== undefined ||
            input.billingPhone !== undefined || input.billingFrequency !== undefined) {
          await adminClient
            .from('company_client_details')
            .upsert({
              company_id: input.id,
              org_id: orgId,
              billing_entity_name: input.billingEntityName,
              billing_email: input.billingEmail || null,
              billing_phone: input.billingPhone,
            }, { onConflict: 'company_id' })
        }

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update addresses if provided
        if (input.headquartersLocation !== undefined || 
            input.headquartersCity !== undefined ||
            input.headquartersState !== undefined ||
            input.headquartersCountry !== undefined ||
            input.billingAddress !== undefined || 
            input.billingCity !== undefined || 
            input.billingState !== undefined || 
            input.billingPostalCode !== undefined || 
            input.billingCountry !== undefined) {
          
          // Update or insert headquarters address
          if (input.headquartersLocation !== undefined || 
              input.headquartersCity !== undefined ||
              input.headquartersState !== undefined ||
              input.headquartersCountry !== undefined) {
            const { data: existingHQ } = await adminClient
              .from('addresses')
              .select('id')
              .eq('entity_type', 'account')
              .eq('entity_id', input.id)
              .eq('address_type', 'headquarters')
              .single()

            if (existingHQ) {
              const hqUpdateData: Record<string, unknown> = {
                updated_by: user?.id,
                updated_at: new Date().toISOString(),
              }
              if (input.headquartersLocation !== undefined) {
                hqUpdateData.address_line_1 = input.headquartersLocation
              }
              if (input.headquartersCity !== undefined) {
                hqUpdateData.city = input.headquartersCity
              }
              if (input.headquartersState !== undefined) {
                hqUpdateData.state_province = input.headquartersState
              }
              if (input.headquartersCountry !== undefined) {
                hqUpdateData.country_code = input.headquartersCountry === 'USA' ? 'US' : (input.headquartersCountry || 'US')
              }
              await adminClient
                .from('addresses')
                .update(hqUpdateData)
                .eq('id', existingHQ.id)
            } else if (input.headquartersLocation || input.headquartersCity) {
              await adminClient
                .from('addresses')
                .insert({
                  org_id: orgId,
                  entity_type: 'account',
                  entity_id: input.id,
                  address_type: 'headquarters',
                  address_line_1: input.headquartersLocation || null,
                  city: input.headquartersCity || null,
                  state_province: input.headquartersState || null,
                  country_code: input.headquartersCountry === 'USA' ? 'US' : (input.headquartersCountry || 'US'),
                  is_primary: true,
                  created_by: user?.id,
                })
            }
          }

          // Update or insert billing address
          if (input.billingAddress !== undefined || 
              input.billingCity !== undefined || 
              input.billingState !== undefined || 
              input.billingPostalCode !== undefined || 
              input.billingCountry !== undefined) {
            
            const { data: existingBilling } = await adminClient
              .from('addresses')
              .select('id')
              .eq('entity_type', 'account')
              .eq('entity_id', input.id)
              .eq('address_type', 'billing')
              .single()

            const billingData: Record<string, unknown> = {
              updated_by: user?.id,
              updated_at: new Date().toISOString(),
            }
            if (input.billingAddress !== undefined) billingData.address_line_1 = input.billingAddress
            if (input.billingCity !== undefined) billingData.city = input.billingCity
            if (input.billingState !== undefined) billingData.state_province = input.billingState
            if (input.billingPostalCode !== undefined) billingData.postal_code = input.billingPostalCode
            if (input.billingCountry !== undefined) {
              billingData.country_code = input.billingCountry === 'USA' ? 'US' : (input.billingCountry || 'US')
            }

            if (existingBilling) {
              await adminClient
                .from('addresses')
                .update(billingData)
                .eq('id', existingBilling.id)
            } else if (input.billingAddress || input.billingCity || input.billingState || input.billingPostalCode) {
              await adminClient
                .from('addresses')
                .insert({
                  org_id: orgId,
                  entity_type: 'account',
                  entity_id: input.id,
                  address_type: 'billing',
                  ...billingData,
                  is_primary: false,
                  created_by: user?.id,
                })
            }
          }
        }

        // Update or create primary contact if provided
        if (input.primaryContactName !== undefined || 
            input.primaryContactEmail !== undefined ||
            input.primaryContactTitle !== undefined ||
            input.primaryContactPhone !== undefined) {
          
          // Find existing primary contact for this account
          const { data: existingPrimaryContact } = await adminClient
            .from('contacts')
            .select('id')
            .eq('company_id', input.id)
            .eq('is_primary', true)
            .maybeSingle()

          // Parse name into first/last if provided
          let firstName = ''
          let lastName = ''
          if (input.primaryContactName) {
            const nameParts = input.primaryContactName.split(' ')
            firstName = nameParts[0] || ''
            lastName = nameParts.slice(1).join(' ') || ''
          }

          if (existingPrimaryContact) {
            // Update existing primary contact
            const contactUpdateData: Record<string, unknown> = {
              updated_by: user?.id,
              updated_at: new Date().toISOString(),
            }
            if (input.primaryContactName !== undefined) {
              contactUpdateData.first_name = firstName || 'Primary'
              contactUpdateData.last_name = lastName || 'Contact'
            }
            if (input.primaryContactEmail !== undefined) {
              contactUpdateData.email = input.primaryContactEmail || null
            }
            if (input.primaryContactTitle !== undefined) {
              contactUpdateData.title = input.primaryContactTitle || null
            }
            if (input.primaryContactPhone !== undefined) {
              contactUpdateData.phone = input.primaryContactPhone || null
            }

            await adminClient
              .from('contacts')
              .update(contactUpdateData)
              .eq('id', existingPrimaryContact.id)
          } else if (input.primaryContactEmail || input.primaryContactName) {
            // Create new primary contact if email or name provided
            await adminClient
              .from('contacts')
              .insert({
                org_id: orgId,
                company_id: input.id,
                category: 'person',
                subtype: 'person_client_contact',
                first_name: firstName || 'Primary',
                last_name: lastName || 'Contact',
                email: input.primaryContactEmail || null,
                phone: input.primaryContactPhone || null,
                title: input.primaryContactTitle || null,
                is_primary: true,
                created_by: user?.id,
              })
          }
        }

        // HISTORY: Record all field changes (fire-and-forget)
        if (beforeSnapshot && data) {
          void historyService.detectAndRecordChanges(
            'account',
            input.id,
            beforeSnapshot,
            data,
            { orgId, userId: user?.id ?? null }
          ).catch(err => console.error('[History] Failed to record account changes:', err))
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
          .from('companies')
          .update({
            status: input.status,
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
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
        industries: z.array(z.string()).optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        companySize: z.enum(['1-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional(),
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
        billingContactPhone: z.string().optional(),
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
        // Additional contacts added during onboarding
        additionalContacts: z.array(z.object({
          firstName: z.string(),
          lastName: z.string().optional(),
          email: z.string(),
          phone: z.string().optional(),
          title: z.string().optional(),
          roles: z.array(z.string()).optional(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Build the update data
        // Note: onboarding_completed_by and updated_by omitted - FK requires user_profiles.id, not auth.users.id
        const updateData: Record<string, unknown> = {
          onboarding_status: 'completed',
          onboarding_completed_at: new Date().toISOString(),
        }

        // Map onboarding data to account fields
        if (input.legalName) updateData.legal_name = input.legalName
        if (input.industry) updateData.industry = input.industry
        if (input.linkedinUrl) updateData.linkedin_url = input.linkedinUrl || null
        if (input.paymentTerms) {
          const terms = { net_15: 'Net 15', net_30: 'Net 30', net_45: 'Net 45', net_60: 'Net 60' }
          updateData.default_payment_terms = terms[input.paymentTerms]
        }
        if (input.poRequired !== undefined) updateData.requires_po = input.poRequired
        if (input.preferredContactMethod) updateData.preferred_contact_method = input.preferredContactMethod
        if (input.meetingCadence) updateData.meeting_cadence = input.meetingCadence

        // Store extended onboarding data as metadata
        const onboardingData: Record<string, unknown> = {}
        if (input.dba) onboardingData.dba = input.dba
        if (input.industries && input.industries.length > 0) onboardingData.industries = input.industries
        if (input.companySize) onboardingData.company_size = input.companySize
        if (input.fundingStage) onboardingData.funding_stage = input.fundingStage
        if (input.taxId) onboardingData.tax_id = input.taxId
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

        // Update the company
        const { data, error } = await adminClient
          .from('companies')
          .update(updateData)
          .eq('id', input.accountId)
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update or create company_client_details with billing information
        if (input.billingContactName || input.billingContactEmail || input.billingContactPhone || input.poRequired !== undefined) {
          await adminClient
            .from('company_client_details')
            .upsert({
              company_id: input.accountId,
              org_id: orgId,
              billing_entity_name: input.billingContactName || null,
              billing_email: input.billingContactEmail || null,
              billing_phone: input.billingContactPhone || null,
              po_required: input.poRequired !== undefined ? input.poRequired : false,
            }, { onConflict: 'company_id' })
        }

        // Create or update headquarters address if provided
        if (input.streetAddress || input.city || input.state || input.zipCode) {
          const { data: existingHQ } = await adminClient
            .from('addresses')
            .select('id')
            .eq('entity_type', 'account')
            .eq('entity_id', input.accountId)
            .eq('address_type', 'headquarters')
            .maybeSingle()

          const hqAddressData = {
            org_id: orgId,
            entity_type: 'account' as const,
            entity_id: input.accountId,
            address_type: 'headquarters' as const,
            address_line_1: input.streetAddress || null,
            city: input.city || null,
            state_province: input.state || null,
            postal_code: input.zipCode || null,
            country_code: input.country === 'USA' ? 'US' : (input.country || 'US'),
            is_primary: true,
            created_by: user?.id,
          }

          if (existingHQ) {
            await adminClient
              .from('addresses')
              .update({
                address_line_1: input.streetAddress || null,
                city: input.city || null,
                state_province: input.state || null,
                postal_code: input.zipCode || null,
                country_code: input.country === 'USA' ? 'US' : (input.country || 'US'),
                updated_by: user?.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingHQ.id)
          } else {
            await adminClient
              .from('addresses')
              .insert(hqAddressData)
          }
        }

        // Create activity log for onboarding completion
        // Note: created_by omitted - FK requires user_profiles.id, not auth.users.id
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'company',
            entity_id: input.accountId,
            activity_type: 'note',
            status: 'completed',
            subject: 'Onboarding Completed',
            body: 'Account onboarding wizard has been completed.',
          })

        // Create additional contacts if provided
        if (input.additionalContacts && input.additionalContacts.length > 0) {
          // Get existing contact emails to avoid duplicates
          const { data: existingContacts } = await adminClient
            .from('contacts')
            .select('email')
            .eq('org_id', orgId)
            .eq('company_id', input.accountId)
            .is('deleted_at', null)

          const existingEmails = new Set((existingContacts || []).map((c: { email: string | null }) => c.email?.toLowerCase()))

          // Filter out contacts that already exist (by email)
          const newContacts = input.additionalContacts.filter(
            contact => contact.email && !existingEmails.has(contact.email.toLowerCase())
          )

          if (newContacts.length > 0) {
            const contactInserts = newContacts.map(contact => ({
              org_id: orgId,
              company_id: input.accountId,
              category: 'person' as const,
              subtype: 'person_client_contact' as const,
              first_name: contact.firstName,
              last_name: contact.lastName || '',
              email: contact.email,
              phone: contact.phone || null,
              title: contact.title || null,
              is_primary: contact.roles?.includes('primary') || false,
              created_by: user?.id,
            }))

            const { error: contactsError } = await adminClient
              .from('contacts')
              .insert(contactInserts)

            if (contactsError) {
              console.error('[CompleteOnboarding] Failed to create contacts:', contactsError)
            }
          }
        }

        return data
      }),

    // Stats for accounts list view
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get company counts by status (clients/prospects only)
        const { data: accounts, error: accountsError } = await adminClient
          .from('companies')
          .select('id, status')
          .eq('org_id', orgId)
          .in('category', ['client', 'prospect'])
          .is('deleted_at', null)

        if (accountsError) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: accountsError.message })
        }

        // Get jobs count this quarter
        const startOfQuarter = new Date()
        startOfQuarter.setMonth(Math.floor(startOfQuarter.getMonth() / 3) * 3, 1)
        startOfQuarter.setHours(0, 0, 0, 0)

        const { count: jobsThisQuarter } = await adminClient
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .gte('created_at', startOfQuarter.toISOString())

        // Get placements YTD
        const startOfYear = new Date(new Date().getFullYear(), 0, 1)

        const { count: placementsYTD } = await adminClient
          .from('placements')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .gte('created_at', startOfYear.toISOString())

        return {
          total: accounts?.length ?? 0,
          activeClients: accounts?.filter(a => a.status === 'active').length ?? 0,
          prospects: accounts?.filter(a => a.status === 'prospect').length ?? 0,
          jobsThisQuarter: jobsThisQuarter ?? 0,
          placementsYTD: placementsYTD ?? 0,
        }
      }),

    // Link two accounts together with a relationship
    linkAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        relatedAccountId: z.string().uuid(),
        relationshipCategory: z.enum([
          'parent_child',
          'msp_client',
          'prime_sub',
          'referral_partner',
          'competitor',
          'affiliate',
          'merger_acquisition',
        ]),
        notes: z.string().optional(),
        startedDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get user profile ID for created_by
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

        // Check if relationship already exists
        const { data: existing } = await adminClient
          .from('company_relationships')
          .select('id')
          .eq('org_id', orgId)
          .or(`and(company_a_id.eq.${input.accountId},company_b_id.eq.${input.relatedAccountId}),and(company_a_id.eq.${input.relatedAccountId},company_b_id.eq.${input.accountId})`)
          .is('deleted_at', null)
          .maybeSingle()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A relationship between these accounts already exists',
          })
        }

        const { data, error } = await adminClient
          .from('company_relationships')
          .insert({
            org_id: orgId,
            company_a_id: input.accountId,
            company_b_id: input.relatedAccountId,
            relationship_category: input.relationshipCategory,
            relationship_direction: 'both', // Default to bidirectional
            notes: input.notes,
            started_date: input.startedDate,
            is_active: true,
            created_by: userProfileId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Update an account relationship
    updateAccountRelationship: orgProtectedProcedure
      .input(z.object({
        relationshipId: z.string().uuid(),
        relationshipCategory: z.enum([
          'parent_child',
          'msp_client',
          'prime_sub',
          'referral_partner',
          'competitor',
          'affiliate',
          'merger_acquisition',
        ]).optional(),
        notes: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {}
        if (input.relationshipCategory !== undefined) {
          updateData.relationship_category = input.relationshipCategory
        }
        if (input.notes !== undefined) {
          updateData.notes = input.notes
        }
        if (input.isActive !== undefined) {
          updateData.is_active = input.isActive
        }
        updateData.updated_at = new Date().toISOString()

        const { data, error } = await adminClient
          .from('company_relationships')
          .update(updateData)
          .eq('id', input.relationshipId)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Remove (soft delete) an account relationship
    unlinkAccount: orgProtectedProcedure
      .input(z.object({
        relationshipId: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('company_relationships')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', input.relationshipId)
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // CONTRACTS (Account Documents - MSA, SOW, NDA)
  // Uses unified contracts table with entity_type='account'
  // ============================================
  contracts: router({
    // List contracts/documents for an account
    listByAccount: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contracts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name)
          `)
          .eq('org_id', orgId)
          .eq('entity_type', 'account')
          .eq('entity_id', input.accountId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to list account contracts:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Transform to camelCase for frontend
        return (data || []).map(item => ({
          id: item.id,
          accountId: item.entity_id,
          contractNumber: item.contract_number,
          name: item.contract_name,
          contractType: item.contract_type,
          category: item.category,
          status: item.status,
          effectiveDate: item.effective_date,
          expiryDate: item.expiry_date,
          value: item.contract_value ? Number(item.contract_value) : null,
          currency: item.currency,
          documentUrl: item.document_url,
          signedDocumentUrl: item.signed_document_url,
          autoRenew: item.auto_renew,
          renewalTermMonths: item.renewal_term_months,
          renewalNoticeDays: item.renewal_notice_days,
          terms: item.terms,
          notes: item.terms?.notes || null,
          owner: item.owner,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          createdBy: item.created_by,
        }))
      }),

    // Create a new contract
    create: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        contractType: z.enum(['msa', 'sow', 'nda', 'amendment', 'addendum', 'rate_card_agreement', 'sla', 'vendor_agreement', 'other']),
        name: z.string().min(1),
        contractNumber: z.string().max(50).optional(),
        category: z.string().max(50).optional(),
        status: z.enum(['draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated']).default('draft'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        value: z.number().optional(),
        currency: z.string().default('USD'),
        paymentTermsDays: z.number().optional(),
        autoRenew: z.boolean().default(false),
        renewalTermMonths: z.number().optional(),
        renewalNoticeDays: z.number().default(30),
        documentUrl: z.string().url().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Look up user_profiles.id from auth_id (user.id is auth.users.id)
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id || null
        }

        const { data, error } = await adminClient
          .from('contracts')
          .insert({
            org_id: orgId,
            entity_type: 'account',
            entity_id: input.accountId,
            contract_name: input.name,
            contract_number: input.contractNumber,
            contract_type: input.contractType,
            category: input.category,
            status: input.status,
            effective_date: input.startDate,
            expiry_date: input.endDate,
            contract_value: input.value,
            currency: input.currency,
            auto_renew: input.autoRenew,
            renewal_term_months: input.renewalTermMonths,
            renewal_notice_days: input.renewalNoticeDays,
            document_url: input.documentUrl || null,
            terms: input.notes || input.paymentTermsDays ? {
              notes: input.notes,
              paymentTermsDays: input.paymentTermsDays,
            } : {},
            owner_id: userProfileId,
            created_by: userProfileId,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create contract:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          id: data.id,
          accountId: data.entity_id,
          name: data.contract_name,
          contractType: data.contract_type,
          status: data.status,
        }
      }),

    // Upload document file to Supabase Storage
    uploadFile: orgProtectedProcedure
      .input(z.object({
        accountId: z.string().uuid(),
        contractId: z.string().uuid(),
        fileData: z.string(), // base64 encoded file
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Decode base64 file
        const base64Data = input.fileData.split(',')[1] || input.fileData
        const fileBuffer = Buffer.from(base64Data, 'base64')

        // Generate storage path
        const timestamp = Date.now()
        const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `${orgId}/contracts/${input.accountId}/${timestamp}_${sanitizedFileName}`

        // Upload to Supabase Storage using admin client to bypass RLS
        const { error: uploadError } = await adminClient
          .storage
          .from('documents')
          .upload(storagePath, fileBuffer, {
            contentType: input.mimeType,
            upsert: true,
          })

        if (uploadError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to upload file: ${uploadError.message}`,
          })
        }

        // Get public URL
        const { data: urlData } = adminClient
          .storage
          .from('documents')
          .getPublicUrl(storagePath)

        // Update the contract with the document URL
        const { data, error } = await adminClient
          .from('contracts')
          .update({
            document_url: urlData.publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.contractId)
          .eq('org_id', orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          id: data.id,
          documentUrl: urlData.publicUrl,
        }
      }),

    // Get contract by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contracts')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .single()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' })
        }

        return {
          id: data.id,
          accountId: data.entity_id,
          contractNumber: data.contract_number,
          name: data.contract_name,
          contractType: data.contract_type,
          category: data.category,
          status: data.status,
          effectiveDate: data.effective_date,
          expiryDate: data.expiry_date,
          value: data.contract_value ? Number(data.contract_value) : null,
          currency: data.currency,
          documentUrl: data.document_url,
          signedDocumentUrl: data.signed_document_url,
          autoRenew: data.auto_renew,
          renewalTermMonths: data.renewal_term_months,
          renewalNoticeDays: data.renewal_notice_days,
          terms: data.terms,
          owner: data.owner,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      }),

    // Update contract
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        contractNumber: z.string().max(50).optional(),
        contractType: z.enum(['msa', 'sow', 'nda', 'amendment', 'addendum', 'rate_card_agreement', 'sla', 'vendor_agreement', 'other']).optional(),
        category: z.string().max(50).optional(),
        status: z.enum(['draft', 'pending_review', 'pending_signature', 'active', 'expired', 'terminated']).optional(),
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable(),
        value: z.number().optional().nullable(),
        currency: z.string().optional(),
        autoRenew: z.boolean().optional(),
        renewalTermMonths: z.number().optional().nullable(),
        renewalNoticeDays: z.number().optional(),
        documentUrl: z.string().url().optional().nullable(),
        notes: z.string().optional().nullable(),
        paymentTermsDays: z.number().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (input.name !== undefined) updateData.contract_name = input.name
        if (input.contractNumber !== undefined) updateData.contract_number = input.contractNumber
        if (input.contractType !== undefined) updateData.contract_type = input.contractType
        if (input.category !== undefined) updateData.category = input.category
        if (input.status !== undefined) updateData.status = input.status
        if (input.startDate !== undefined) updateData.effective_date = input.startDate
        if (input.endDate !== undefined) updateData.expiry_date = input.endDate
        if (input.value !== undefined) updateData.contract_value = input.value
        if (input.currency !== undefined) updateData.currency = input.currency
        if (input.autoRenew !== undefined) updateData.auto_renew = input.autoRenew
        if (input.renewalTermMonths !== undefined) updateData.renewal_term_months = input.renewalTermMonths
        if (input.renewalNoticeDays !== undefined) updateData.renewal_notice_days = input.renewalNoticeDays
        if (input.documentUrl !== undefined) updateData.document_url = input.documentUrl

        // Handle terms JSON field for notes and payment terms
        if (input.notes !== undefined || input.paymentTermsDays !== undefined) {
          // First get current terms
          const { data: current } = await adminClient
            .from('contracts')
            .select('terms')
            .eq('id', input.id)
            .single()

          const currentTerms = (current?.terms || {}) as Record<string, unknown>
          if (input.notes !== undefined) currentTerms.notes = input.notes
          if (input.paymentTermsDays !== undefined) currentTerms.paymentTermsDays = input.paymentTermsDays
          updateData.terms = currentTerms
        }

        const { data, error } = await adminClient
          .from('contracts')
          .update(updateData)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          id: data.id,
          name: data.contract_name,
          status: data.status,
        }
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
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // LEADS (B01/B02 - Prospect & Qualify)
  // ============================================
  // @deprecated WAVE 2 Migration - Use unifiedContacts.leads router instead
  // This legacy router maintains backwards compatibility but will be removed in a future release.
  // All new code should use trpc.unifiedContacts.leads.* procedures.
  // Migration completed: 2025-12-11
  leads: router({
    // List leads with filtering
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['new', 'contacted', 'qualified', 'unqualified', 'nurture', 'converted', 'all']).default('all'),
        source: z.string().optional(),
        ownerId: z.string().uuid().optional(),
        campaignId: z.string().uuid().optional(),
        minScore: z.number().min(0).max(100).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['created_at', 'bant_total_score', 'company_name', 'first_name', 'status', 'last_contacted_at', 'source', 'campaign_id']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('leads')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url), campaign:campaigns!campaign_id(id, name)', { count: 'exact' })
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
        if (input.campaignId) {
          query = query.eq('campaign_id', input.campaignId)
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
          .from('activities')
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
        source: z.enum(['linkedin', 'referral', 'cold_outreach', 'inbound', 'event', 'website', 'campaign', 'other']),
        sourceDetails: z.string().optional(),
        referralName: z.string().optional(),
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
            campaign_id: input.campaignId || null,
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
          .from('activities')
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
        campaignId: z.string().uuid().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
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
        if (input.campaignId !== undefined) updateData.campaign_id = input.campaignId

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

    // Link existing leads to a campaign
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

        // Update leads to link them to the campaign
        const { data, error } = await adminClient
          .from('leads')
          .update({ campaign_id: input.campaignId })
          .in('id', input.leadIds)
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .select('id, company_name, first_name, last_name')

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
              description: `${linkedCount} existing ${linkedCount === 1 ? 'lead' : 'leads'} linked to campaign`,
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
          .from('leads')
          .select('id, company_name, first_name, last_name, email, status, lead_score, created_at')
          .eq('org_id', orgId)
          .is('campaign_id', null)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.search) {
          query = query.or(`company_name.ilike.%${input.search}%,first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data || []
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
          .from('activities')
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
          .from('activities')
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
          .from('activities')
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
          .from('activities')
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
          .from('activities')
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
        const { orgId } = ctx
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

    // List leads by campaign
    listByCampaign: orgProtectedProcedure
      .input(z.object({
        campaignId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('leads')
          .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .eq('campaign_id', input.campaignId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data ?? []
      }),

    // Get aggregate stats for leads list page (no owner filtering)
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get all leads for this org (not deleted)
        const { data: leads, count: totalCount } = await adminClient
          .from('leads')
          .select('id, status, bant_total_score, created_at', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Count new leads this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const newThisWeek = leads?.filter(l => new Date(l.created_at) >= oneWeekAgo).length ?? 0

        // Count qualified leads
        const qualified = leads?.filter(l => l.status === 'qualified').length ?? 0

        // Calculate conversion rate (converted / total non-new leads)
        const converted = leads?.filter(l => l.status === 'converted').length ?? 0
        const totalProcessed = (leads?.length ?? 0) - (leads?.filter(l => l.status === 'new').length ?? 0)
        const conversionRate = totalProcessed > 0
          ? (converted / totalProcessed) * 100
          : 0

        return {
          total: totalCount ?? 0,
          new: newThisWeek,
          qualified,
          conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
        }
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
        sortBy: z.enum(['created_at', 'expected_close_date', 'value', 'last_activity_at', 'name', 'stage', 'probability']).default('expected_close_date'),
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
            company:companies!deals_company_id_fkey(id, name, segment),
            lead:leads!lead_id(id, company_name, first_name, last_name)
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
            company:companies!deals_company_id_fkey(id, name),
            lead:leads!lead_id(id, company_name)
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
            company:companies!deals_company_id_fkey(id, name, segment, website),
            lead:leads!lead_id(id, company_name, first_name, last_name, email, phone),
            created_company:companies!created_company_id(id, name)
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
          .select('*, contact:contacts(id, first_name, last_name, email)')
          .eq('deal_id', input.id)
          .eq('is_active', true)

        // Get activities
        const { data: activities } = await adminClient
          .from('activities')
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

    /**
     * Get full deal entity with ALL section data in ONE database round-trip
     * This follows the ONE DATABASE CALL pattern for detail pages.
     *
     * Returns:
     * - Main deal with immediate relations (owner, company, lead)
     * - stakeholders: All deal contacts/stakeholders
     * - stageHistory: Stage progression timeline
     * - activities: Activity logs
     * - tasks: Assigned tasks
     * - notes: Reference notes
     * - documents: Attached files
     * - account: Full account details if linked
     */
    getFullEntity: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Step 1: Main entity with immediate relations
        const { data: deal, error } = await adminClient
          .from('deals')
          .select(`
            *,
            owner:user_profiles!owner_id(id, full_name, avatar_url, email),
            secondary_owner:user_profiles!secondary_owner_id(id, full_name),
            pod_manager:user_profiles!pod_manager_id(id, full_name),
            company:companies!deals_company_id_fkey(id, name, segment, website, industry, employee_count, phone, headquarters_city, headquarters_state),
            lead:leads!lead_id(id, company_name, first_name, last_name, email, phone),
            created_company:companies!created_company_id(id, name)
          `)
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error || !deal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        // Step 2: ALL section data in parallel (single round-trip)
        const [
          stageHistoryResult,
          stakeholdersResult,
          activitiesResult,
          tasksResult,
          notesResult,
          documentsResult,
        ] = await Promise.all([
          // Stage history timeline
          adminClient
            .from('deal_stages_history')
            .select('*, changed_by_user:user_profiles!changed_by(id, full_name)')
            .eq('deal_id', input.id)
            .order('entered_at', { ascending: false })
            .limit(50),

          // Stakeholders (contacts for this deal)
          adminClient
            .from('deal_stakeholders')
            .select('*, contact:contacts(id, first_name, last_name, email, phone, title)')
            .eq('deal_id', input.id)
            .eq('is_active', true)
            .order('is_primary', { ascending: false })
            .limit(50),

          // Activities
          adminClient
            .from('activities')
            .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
            .eq('entity_type', 'deal')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(100),

          // Tasks
          adminClient
            .from('tasks')
            .select('*, assignee:user_profiles!assignee_id(id, full_name)')
            .eq('entity_type', 'deal')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('due_date', { ascending: true })
            .limit(50),

          // Notes (from unified notes table)
          adminClient
            .from('notes')
            .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
            .eq('entity_type', 'deal')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents (from unified documents table)
          adminClient
            .from('documents')
            .select('*, uploader:user_profiles!uploaded_by(id, full_name)')
            .eq('entity_type', 'deal')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),
        ])

        // Build account data for Account section (if deal has company linked)
        const account = deal.company ? {
          id: deal.company.id,
          name: deal.company.name,
          industry: deal.company.industry,
          segment: deal.company.segment,
          website: deal.company.website,
          phone: deal.company.phone,
          employeeCount: deal.company.employee_count,
          city: deal.company.headquarters_city,
          state: deal.company.headquarters_state,
        } : null

        // Return with section counts for sidebar badges
        return {
          // Main entity data
          ...deal,
          // Override company with enriched account data
          account,
          // Section data
          sections: {
            stakeholders: {
              items: stakeholdersResult.data ?? [],
              total: stakeholdersResult.data?.length ?? 0,
            },
            stageHistory: {
              items: stageHistoryResult.data ?? [],
              total: stageHistoryResult.data?.length ?? 0,
            },
            activities: {
              items: activitiesResult.data ?? [],
              total: activitiesResult.data?.length ?? 0,
            },
            tasks: {
              items: tasksResult.data ?? [],
              total: tasksResult.data?.length ?? 0,
            },
            notes: {
              items: notesResult.data ?? [],
              total: notesResult.data?.length ?? 0,
            },
            documents: {
              items: documentsResult.data ?? [],
              total: documentsResult.data?.length ?? 0,
            },
          },
          // Backward compatibility - keep flat arrays for existing section components
          stageHistory: stageHistoryResult.data ?? [],
          stakeholders: stakeholdersResult.data ?? [],
          activities: activitiesResult.data ?? [],
          tasks: tasksResult.data ?? [],
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
          .select('*, owner:user_profiles!owner_id(id, full_name), company:companies!deals_company_id_fkey(id, name)')
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
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Deal Created',
            description: `New deal created: ${input.name} ($${input.value.toLocaleString()})`,
            created_by: user?.id,
          })

        // Trigger workflows for deal creation
        if (user?.id) {
          const workflowEngine = createWorkflowEngine(orgId, user.id)
          await workflowEngine.checkTriggers('deal', data.id, {
            type: 'created',
            newValue: data,
          }).catch(err => console.error('[Workflow] Deal create trigger failed:', err))
        }

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
          .select('*, owner:user_profiles!owner_id(id, full_name), company:companies!deals_company_id_fkey(id, name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Trigger workflows for deal update
        if (user?.id) {
          const workflowEngine = createWorkflowEngine(orgId, user.id)
          await workflowEngine.checkTriggers('deal', input.id, {
            type: 'updated',
            newValue: data,
          }).catch(err => console.error('[Workflow] Deal update trigger failed:', err))
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

        // Check for blocking activities when moving to closing stages
        const closingStages = ['closed_won', 'closed_lost', 'cancelled']
        if (closingStages.includes(input.stage)) {
          const blockCheck = await checkBlockingActivities({
            entityType: 'deal',
            entityId: input.id,
            targetStatus: input.stage,
            orgId,
            supabase: adminClient,
          })
          if (blockCheck.blocked) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: `Cannot change to ${input.stage}: ${blockCheck.activities.length} blocking ${blockCheck.activities.length === 1 ? 'activity' : 'activities'} must be completed first`,
              cause: { blockingActivities: blockCheck.activities },
            })
          }
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
          .select('*, owner:user_profiles!owner_id(id, full_name), company:companies!deals_company_id_fkey(id, name)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'deal',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Stage Changed',
            description: `Deal moved from ${currentDeal.stage} to ${input.stage}${input.notes ? `. ${input.notes}` : ''}`,
            created_by: user?.id,
          })

        // Trigger workflows for deal stage change
        if (user?.id) {
          const workflowEngine = createWorkflowEngine(orgId, user.id)
          await workflowEngine.checkTriggers('deal', input.id, {
            type: 'status_change',
            field: 'stage',
            oldValue: currentDeal.stage,
            newValue: input.stage,
          }).catch(err => console.error('[Workflow] Deal stage change trigger failed:', err))
        }

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
          .select('*, lead:leads!lead_id(company_name, first_name, last_name)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (!deal) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deal not found' })
        }

        // Check for blocking activities before closing deal as won
        const blockCheck = await checkBlockingActivities({
          entityType: 'deal',
          entityId: input.id,
          targetStatus: 'closed_won',
          orgId,
          supabase: adminClient,
        })
        if (blockCheck.blocked) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Cannot close deal as won: ${blockCheck.activities.length} blocking ${blockCheck.activities.length === 1 ? 'activity' : 'activities'} must be completed first`,
            cause: { blockingActivities: blockCheck.activities },
          })
        }

        let createdAccountId = deal.account_id

        // Create new company (client) if requested
        if (input.createAccount && !createdAccountId) {
          const accountName = input.accountName || deal.lead?.company_name || deal.name
          const paymentTermsDays = parseInt(input.paymentTerms.replace('net_', ''))
          const { data: newAccount } = await adminClient
            .from('companies')
            .insert({
              org_id: orgId,
              category: 'client',
              name: accountName,
              industry: input.accountIndustry,
              status: 'active',
              relationship_type: 'direct_client',
              default_payment_terms: `Net ${paymentTermsDays}`,
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
          .select('*, owner:user_profiles!owner_id(id, full_name), company:companies!deals_company_id_fkey(id, name)')
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
          .from('activities')
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

        // Check for blocking activities before closing deal as lost
        const blockCheck = await checkBlockingActivities({
          entityType: 'deal',
          entityId: input.id,
          targetStatus: 'closed_lost',
          orgId,
          supabase: adminClient,
        })
        if (blockCheck.blocked) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: `Cannot close deal as lost: ${blockCheck.activities.length} blocking ${blockCheck.activities.length === 1 ? 'activity' : 'activities'} must be completed first`,
            cause: { blockingActivities: blockCheck.activities },
          })
        }

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
          .from('activities')
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
          .from('activities')
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
          months: sortedMonths.map(({ deals: _deals, ...rest }) => rest),
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

        const dealArray = stakeholder?.deal as Array<{ org_id: string }> | null
        if (!stakeholder || dealArray?.[0]?.org_id !== orgId) {
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

    // Get aggregate stats for deals list page (no owner filtering)
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get all deals for this org (not deleted)
        const { data: deals } = await adminClient
          .from('deals')
          .select('id, stage, value, probability, closed_at, created_at')
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Calculate total deals count
        const total = deals?.length ?? 0

        // Calculate pipeline value (deals not won or lost)
        const activePipelineDeals = deals?.filter(d =>
          d.stage !== 'closed_won' && d.stage !== 'closed_lost'
        ) ?? []
        const pipelineValue = activePipelineDeals.reduce((sum, d) => sum + (d.value || 0), 0)

        // Count won this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const wonThisMonth = deals?.filter(d =>
          d.stage === 'closed_won' &&
          d.closed_at &&
          new Date(d.closed_at) >= startOfMonth
        ).length ?? 0

        // Calculate win rate
        const closedWon = deals?.filter(d => d.stage === 'closed_won').length ?? 0
        const closedLost = deals?.filter(d => d.stage === 'closed_lost').length ?? 0
        const totalClosed = closedWon + closedLost
        const winRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0

        // Calculate average deal size (from won deals)
        const wonDeals = deals?.filter(d => d.stage === 'closed_won' && d.value) ?? []
        const avgDealSize = wonDeals.length > 0
          ? wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / wonDeals.length
          : 0

        return {
          total,
          pipelineValue,
          wonThisMonth,
          winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
          avgDealSize: Math.round(avgDealSize),
        }
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
          .select('id, first_name, last_name, title, email, phone, company:companies!contacts_linked_company_id_fkey(id, name)')
          .eq('org_id', orgId)
          .is('deleted_at', null)
          .limit(input.limit)

        if (input.query) {
          query = query.or(`first_name.ilike.%${input.query}%,last_name.ilike.%${input.query}%,email.ilike.%${input.query}%`)
        }

        if (input.accountId) {
          query = query.eq('linked_company_id', input.accountId)
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
          account: (c.company as Array<{ id: string; name: string }> | null)?.[0] ?? null,
        })) ?? []
      }),

    // List all contacts with optional filters and sorting
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        accountId: z.string().uuid().optional(),
        status: z.string().optional(),
        type: z.string().optional(),
        isPrimary: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().default(0),
        sortBy: z.enum(['name', 'title', 'company_id', 'subtype', 'status', 'last_contact_date', 'owner_id', 'created_at']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('contacts')
          .select('*, company:companies!contacts_linked_company_id_fkey(id, name), owner:user_profiles!owner_id(id, full_name, avatar_url)', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (input.search) {
          query = query.or(`first_name.ilike.%${input.search}%,last_name.ilike.%${input.search}%,email.ilike.%${input.search}%`)
        }

        if (input.accountId) {
          query = query.eq('linked_company_id', input.accountId)
        }

        if (input.status) {
          query = query.eq('status', input.status)
        }

        if (input.type) {
          query = query.eq('subtype', input.type)
        }

        if (input.isPrimary !== undefined) {
          query = query.eq('is_primary', input.isPrimary)
        }

        // Handle sorting - for 'name' we sort by first_name
        const sortColumn = input.sortBy === 'name' ? 'first_name' : input.sortBy
        query = query.order(sortColumn, { ascending: input.sortOrder === 'asc' })
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error, count } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return {
          items: data?.map(c => ({
            ...c,
            lastContactDate: c.last_contact_date,
            createdAt: c.created_at,
            type: c.subtype,
          })) ?? [],
          total: count ?? 0,
        }
      }),

    // Stats for contacts list view
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get all contacts for this org
        const { data: contacts, error } = await adminClient
          .from('contacts')
          .select('id, status, is_decision_maker, last_contact_date')
          .eq('org_id', orgId)
          .is('deleted_at', null)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        const total = contacts?.length ?? 0
        const active = contacts?.filter(c => c.status === 'active').length ?? 0
        const decisionMakers = contacts?.filter(c => c.is_decision_maker).length ?? 0

        // Recently contacted (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentlyContacted = contacts?.filter(c =>
          c.last_contact_date && new Date(c.last_contact_date) >= thirtyDaysAgo
        ).length ?? 0

        return {
          total,
          active,
          decisionMakers,
          recentlyContacted,
        }
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

    // Get contact by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('contacts')
          .select('*, company:companies!contacts_linked_company_id_fkey(id, name)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' })
        }

        return data
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
        // Optional address
        address: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zip: z.string().optional(),
          country: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get the user_profile.id for the current user (needed for FK constraints)
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

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
            linked_company_id: input.accountId, // Also set linked_company_id for FK relationship
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
            category: 'person',
            subtype: 'person_client_contact',
            status: 'active',
            created_by: userProfileId,
          })
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Create address if provided
        if (input.address && (input.address.street || input.address.city)) {
          await adminClient
            .from('addresses')
            .insert({
              org_id: orgId,
              entity_type: 'contact',
              entity_id: data.id,
              address_type: 'work',
              address_line_1: input.address.street,
              city: input.address.city,
              state_province: input.address.state,
              postal_code: input.address.zip,
              country_code: input.address.country || 'US',
              is_primary: true,
              created_by: userProfileId,
              updated_by: userProfileId,
            })
        }

        // HISTORY: Record contact creation (fire-and-forget)
        const contactName = `${input.firstName} ${input.lastName || ''}`.trim()
        void historyService.recordEntityCreated(
          'contact',
          data.id,
          { orgId, userId: user?.id ?? null },
          { entityName: contactName, metadata: { category: 'person' } }
        ).catch(err => console.error('[History] Failed to record contact creation:', err))

        // HISTORY: Record contact added to parent account
        void historyService.recordRelatedObjectAdded(
          'account',
          input.accountId,
          {
            type: 'contact',
            id: data.id,
            label: contactName,
            metadata: { title: input.title, isPrimary: input.isPrimary }
          },
          { orgId, userId: user?.id ?? null }
        ).catch(err => console.error('[History] Failed to record contact on account:', err))

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

        // Get the user_profile.id for the current user (needed for FK constraints)
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

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

        const updateData: Record<string, unknown> = { updated_by: userProfileId }
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

        // Get the user_profile.id for the current user (needed for FK constraints)
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

        const { error } = await adminClient
          .from('contacts')
          .update({ deleted_at: new Date().toISOString(), updated_by: userProfileId })
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),
  }),

  // ============================================
  // ACCOUNT NOTES - DEPRECATED
  // Use trpc.notes.* instead (NOTES-01 centralized notes system)
  // ============================================

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
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
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

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Look up user_profiles.id from auth_id for FK constraints
        // The meeting_notes table has FK constraints (created_by) that reference user_profiles(id), not auth.users(id)
        const { data: userProfile, error: userProfileError } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userProfileError || !userProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User profile not found' })
        }

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
            created_by: userProfile.id,
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

        if (!user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
        }

        // Look up user_profiles.id from auth_id for FK constraints
        const { data: userProfile, error: userProfileError } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user.id)
          .single()

        if (userProfileError || !userProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User profile not found' })
        }

        // First get the meeting to know the account
        const { data: existingMeeting } = await adminClient
          .from('meeting_notes')
          .select('company_id, title, action_items')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        const updateData: Record<string, unknown> = { updated_by: userProfile.id }
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

        // Create activities for assigned action items
        if (input.actionItems && input.actionItems.length > 0 && existingMeeting) {
          const existingItems = existingMeeting.action_items as { description: string; assigneeId?: string }[] || []
          
          // Find newly assigned items (items with assigneeId that weren't assigned before)
          for (const item of input.actionItems) {
            if (item.assigneeId && item.description) {
              // Check if this item was already assigned to this user
              const wasAlreadyAssigned = existingItems.some(
                existing => existing.description === item.description && existing.assigneeId === item.assigneeId
              )
              
              if (!wasAlreadyAssigned) {
                // Create a task activity for the assignee
                await adminClient.from('activities').insert({
                  org_id: orgId,
                  entity_type: 'company',
                  entity_id: existingMeeting.company_id,
                  activity_type: 'task',
                  status: item.completed ? 'completed' : 'pending',
                  subject: item.description,
                  description: `Action item from meeting: ${existingMeeting.title || input.title || 'Meeting'}`,
                  due_date: item.dueDate,
                  assigned_to: item.assigneeId,
                  performed_by: user?.id,
                  created_by: user?.id,
                })
              }
            }
          }
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

        // Update company last_contacted_date
        if (data?.account_id) {
          await adminClient
            .from('companies')
            .update({ last_contacted_date: now })
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

    // Delete meeting (soft delete)
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('meeting_notes')
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
          .select('*, creator:user_profiles!created_by(id, full_name), assignee:user_profiles!assigned_to(id, full_name)')
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
        rootCause: z.string().optional(),
        resolutionPlan: z.string().optional(),
        assignedTo: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Look up user_profiles.id from auth_id (user.id is Supabase auth user ID)
        // escalations.created_by and assigned_to reference user_profiles(id), not auth.users(id)
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

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
            root_cause: input.rootCause,
            resolution_plan: input.resolutionPlan,
            status: 'open',
            sla_response_due: slaResponseDue.toISOString(),
            sla_resolution_due: slaResolutionDue.toISOString(),
            created_by: userProfileId,
            assigned_to: input.assignedTo || userProfileId,
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
            created_by: userProfileId,
          })

        // Notify managers for high/critical escalations
        if (input.severity === 'high' || input.severity === 'critical') {
          // Get the company to find the account manager
          const { data: account } = await adminClient
            .from('companies')
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
                  .from('companies')
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
        immediateActions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Look up user_profiles.id from auth_id for created_by FK
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

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
        if (input.immediateActions !== undefined) updateData.immediate_actions = input.immediateActions

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
              created_by: userProfileId,
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
              created_by: userProfileId,
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

        // Look up user_profiles.id from auth_id for created_by FK
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

        const { data, error } = await adminClient
          .from('escalation_updates')
          .insert({
            escalation_id: input.escalationId,
            update_type: input.updateType,
            content: input.content,
            is_internal: input.isInternal,
            created_by: userProfileId,
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

        // Look up user_profiles.id from auth_id for resolved_by/created_by FK
        let userProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          userProfileId = profile?.id ?? null
        }

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
            resolved_by: userProfileId,
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
            created_by: userProfileId,
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

        // Query both 'account' and 'company' entity types for backward compatibility
        let query = adminClient
          .from('activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .in('entity_type', ['account', 'company'])
          .eq('entity_id', input.accountId)
          .is('deleted_at', null)
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

    // List activities for contact
    listByContact: orgProtectedProcedure
      .input(z.object({
        contactId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .eq('related_contact_id', input.contactId)
          .order('created_at', { ascending: false })
          .limit(input.limit)

        if (input.activityType !== 'all') {
          query = query.eq('activity_type', input.activityType)
        }

        const { data, error } = await query

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { items: data ?? [] }
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

        // Normalize 'account' to 'company' for consistency (companies table is the source of truth)
        const normalizedEntityType = input.entityType === 'account' ? 'company' : input.entityType

        const { data, error } = await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: normalizedEntityType,
            entity_id: input.entityId,
            activity_type: input.activityType,
            subject: input.subject,
            description: input.description,
            outcome: input.outcome,
            direction: input.direction,
            duration_minutes: input.durationMinutes,
            scheduled_for: input.scheduledAt,
            completed_at: input.completedAt || new Date().toISOString(),
            next_steps: input.nextSteps,
            next_follow_up_date: input.nextFollowUpDate,
            related_contact_id: input.relatedContactId,
            status: 'completed',
            created_by: user?.id,
            assigned_to: user?.id, // Activity assigned to creator by default (shows in My Activities)
            performed_by: user?.id, // Who performed the activity
          })
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Update company last_contacted_date (for account/company entity types)
        if (input.entityType === 'account' || input.entityType === 'company') {
          await adminClient
            .from('companies')
            .update({ last_contacted_date: new Date().toISOString() })
            .eq('id', input.entityId)
            .eq('org_id', orgId)
        }

        return data
      }),

    // Get activity by ID
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url), contact:contacts!related_contact_id(id, first_name, last_name)')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity not found' })
        }

        return data
      }),

    // Update activity
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        subject: z.string().optional(),
        description: z.string().optional(),
        outcome: z.enum(['positive', 'neutral', 'negative', 'no_response', 'left_voicemail', 'busy', 'connected']).optional(),
        nextSteps: z.string().optional(),
        nextFollowUpDate: z.string().datetime().optional().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        const updateData: Record<string, unknown> = { updated_by: user?.id }
        if (input.subject !== undefined) updateData.subject = input.subject
        if (input.description !== undefined) updateData.description = input.description
        if (input.outcome !== undefined) updateData.outcome = input.outcome
        if (input.nextSteps !== undefined) updateData.next_steps = input.nextSteps
        if (input.nextFollowUpDate !== undefined) updateData.next_follow_up_date = input.nextFollowUpDate

        const { data, error } = await adminClient
          .from('activities')
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

    // Delete activity
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { error } = await adminClient
          .from('activities')
          .delete()
          .eq('id', input.id)
          .eq('org_id', orgId)

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { success: true }
      }),

    // List activities by entity (generic)
    listByEntity: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'linkedin_message', 'all']).default('all'),
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        let query = adminClient
          .from('activities')
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url), assignee:user_profiles!assigned_to(id, full_name, avatar_url)')
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
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

    // Create a task/action item for any entity (scheduled activity / to-do)
    createTask: orgProtectedProcedure
      .input(z.object({
        entityType: z.string(),
        entityId: z.string().uuid(),
        activityType: z.enum(['call', 'email', 'meeting', 'note', 'task', 'linkedin_message', 'follow_up']).default('task'),
        subject: z.string().min(1),
        description: z.string().optional(),
        assignedTo: z.string().uuid().optional(),
        dueDate: z.string().datetime().optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
        relatedContactId: z.string().uuid().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Look up user_profiles.id from auth_id (FK constraint requires user_profiles.id)
        let creatorProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          creatorProfileId = profile?.id ?? null
        }

        // If no assignee specified, assign to creator (self)
        const assigneeId = input.assignedTo || creatorProfileId

        const { data, error } = await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            activity_type: input.activityType,
            subject: input.subject,
            description: input.description,
            assigned_to: assigneeId,
            due_date: input.dueDate,
            priority: input.priority,
            status: input.status === 'pending' ? 'open' : input.status, // Map pending to open for DB
            created_by: creatorProfileId,
            related_contact_id: input.relatedContactId,
          })
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url), assignee:user_profiles!assigned_to(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Complete a task
    completeTask: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Look up user_profiles.id from auth_id
        let performerProfileId: string | null = null
        if (user?.id) {
          const { data: profile } = await adminClient
            .from('user_profiles')
            .select('id')
            .eq('auth_id', user.id)
            .single()
          performerProfileId = profile?.id ?? null
        }

        const { data, error } = await adminClient
          .from('activities')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            performed_by: performerProfileId,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select('*, creator:user_profiles!created_by(id, full_name, avatar_url), assignee:user_profiles!assigned_to(id, full_name, avatar_url)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
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
        sortBy: z.enum(['created_at', 'start_date', 'end_date', 'name', 'leads_generated', 'audience_size', 'prospects_contacted', 'budget_spent', 'status', 'campaign_type']).default('created_at'),
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

    // Get aggregate stats for campaigns list page
    stats: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get all campaigns for this org (not deleted)
        const { data: campaigns, count: totalCount } = await adminClient
          .from('campaigns')
          .select('id, status, leads_generated, prospects_contacted', { count: 'exact' })
          .eq('org_id', orgId)
          .is('deleted_at', null)

        // Count active campaigns
        const activeCampaigns = campaigns?.filter(c => c.status === 'active').length ?? 0

        // Sum leads generated across all campaigns
        const leadsGenerated = campaigns?.reduce((sum, c) => sum + (c.leads_generated ?? 0), 0) ?? 0

        // Calculate average conversion rate (leads / prospects contacted)
        const totalProspectsContacted = campaigns?.reduce((sum, c) => sum + (c.prospects_contacted ?? 0), 0) ?? 0
        const conversionRate = totalProspectsContacted > 0
          ? (leadsGenerated / totalProspectsContacted) * 100
          : 0

        return {
          total: totalCount ?? 0,
          active: activeCampaigns,
          leadsGenerated,
          conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
        }
      }),

    // Consolidated list + stats query (optimized for performance)
    listWithStats: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'all']).default('all'),
        type: z.enum(['lead_generation', 're_engagement', 'event_promotion', 'brand_awareness', 'candidate_sourcing', 'all']).default('all'),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        sortBy: z.enum(['created_at', 'start_date', 'end_date', 'name', 'leads_generated', 'audience_size', 'prospects_contacted', 'budget_spent', 'status', 'campaign_type']).default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const startTotal = Date.now()

        // Execute list query and stats aggregation in parallel
        const [listResult, statsResult] = await Promise.all([
          // List query with pagination - SELECT ONLY NEEDED COLUMNS (not *)
          (async () => {
            const startList = Date.now()
            let query = adminClient
              .from('campaigns')
              .select(`
                id, name, campaign_type, goal, status,
                start_date, end_date, channels,
                audience_size, prospects_contacted, prospects_responded,
                leads_generated, meetings_booked,
                target_leads, target_meetings, budget_total, budget_spent,
                created_at,
                owner:user_profiles!owner_id(id, full_name, avatar_url)
              `, { count: 'estimated' })
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

            const result = await query
            console.log(`[PERF] campaigns.listWithStats - list query: ${Date.now() - startList}ms`)
            return result
          })(),

          // Stats query using SQL aggregation (single row, not all campaigns)
          // Falls back gracefully if function doesn't exist yet
          (async () => {
            const startStats = Date.now()
            try {
              const result = await adminClient.rpc('get_campaign_stats', { p_org_id: orgId }).single()
              console.log(`[PERF] campaigns.listWithStats - stats RPC: ${Date.now() - startStats}ms`)
              return result
            } catch (e) {
              console.log(`[PERF] campaigns.listWithStats - stats RPC failed: ${Date.now() - startStats}ms`, e)
              return { data: null, error: null }
            }
          })(),
        ])

        console.log(`[PERF] campaigns.listWithStats - total queries: ${Date.now() - startTotal}ms`)

        const { data, error, count } = listResult

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Use SQL-aggregated stats (fallback to count from list query if RPC not available)
        const statsData = statsResult.data as { total: number; active: number; leads_generated: number; conversion_rate: number } | null
        const stats = statsData ?? { total: count ?? 0, active: 0, leads_generated: 0, conversion_rate: 0 }

        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: (data as any[] | null)?.map(c => ({
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
          stats: {
            total: stats.total ?? 0,
            active: stats.active ?? 0,
            leadsGenerated: stats.leads_generated ?? 0,
            conversionRate: Math.round((stats.conversion_rate ?? 0) * 10) / 10,
          },
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
          .from('campaign_enrollments')
          .select('*, contact:contacts!contact_id(id, first_name, last_name, email, phone, company_name, title)')
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

    // Get campaign by ID with all counts (optimized for sidebar)
    getByIdWithCounts: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Single query with campaign data
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

        // Get all counts AND recent data in parallel (batched for performance)
        const [
          { count: prospectsCount },
          { count: leadsCount },
          { count: activitiesCount },
          { count: notesCount },
          { count: documentsCount },
          { data: funnel },
          { data: recentActivities },
        ] = await Promise.all([
          // Prospects count (exclude converted - they appear in Leads)
          adminClient
            .from('campaign_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', input.id)
            .neq('status', 'converted'),

          // Leads count (from leads table linked to this campaign)
          adminClient
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null),

          // Activities count
          adminClient
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.id)
            .eq('org_id', orgId),

          // Notes count (subset of activities)
          adminClient
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.id)
            .eq('activity_type', 'note')
            .eq('org_id', orgId),

          // Documents count
          adminClient
            .from('campaign_documents')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null),

          // Funnel metrics via RPC
          adminClient.rpc('get_campaign_funnel', { p_campaign_id: input.id }),

          // Recent activities (batched to avoid separate section call)
          adminClient
            .from('activities')
            .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(10),
        ])

        // Calculate sequences count from JSONB
        const sequencesCount = campaign.channels?.length || 0

        // Build funnel data
        const funnelData = funnel?.[0] || {
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
        }

        return {
          // Campaign data
          ...campaign,
          campaignType: campaign.campaign_type,
          targetCriteria: campaign.target_criteria,
          sequences: campaign.sequences,
          complianceSettings: campaign.compliance_settings,
          abTestConfig: campaign.ab_test_config,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          targetLeads: campaign.target_leads,
          targetMeetings: campaign.target_meetings,
          targetRevenue: campaign.target_revenue,
          budgetTotal: campaign.budget_total,
          budgetSpent: campaign.budget_spent,
          audienceSize: campaign.audience_size,
          prospectsContacted: campaign.prospects_contacted,
          prospectsOpened: campaign.prospects_opened,
          prospectsResponded: campaign.prospects_responded,
          leadsGenerated: campaign.leads_generated,
          meetingsBooked: campaign.meetings_booked,

          // Counts
          counts: {
            prospects: prospectsCount || 0,
            leads: leadsCount || 0,
            activities: activitiesCount || 0,
            notes: notesCount || 0,
            documents: documentsCount || 0,
            sequences: sequencesCount,
          },

          // Metrics for sidebar
          metrics: {
            prospects: funnelData.total_prospects,
            contacted: funnelData.contacted,
            opened: funnelData.opened,
            responded: funnelData.responded,
            leads: funnelData.leads,
            meetings: funnelData.meetings,
            conversionRate: funnelData.conversion_rate,
            openRate: funnelData.open_rate,
            responseRate: funnelData.response_rate,
          },

          // Targets
          targets: {
            targetLeads: campaign.target_leads,
            targetMeetings: campaign.target_meetings,
            targetRevenue: campaign.target_revenue,
          },

          // Dates
          dates: {
            startDate: campaign.start_date,
            endDate: campaign.end_date,
          },

          // Funnel for analytics
          funnel: funnelData,

          // Recent activities (batched to avoid separate API call)
          recentActivities: recentActivities ?? [],
        }
      }),

    /**
     * getFullEntity - ONE database call pattern for detail pages
     *
     * Returns the campaign entity with ALL section data pre-loaded.
     * This eliminates separate queries per section component.
     *
     * Sections included:
     * - prospects: Campaign enrollments with contact data
     * - leads: Leads linked to this campaign
     * - activities: All activities for this campaign
     * - notes: Activities with type='note'
     * - documents: Campaign documents
     * - sequence: Sequence steps for this campaign
     */
    getFullEntity: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Step 1: Main entity with immediate relations
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

        if (error || !campaign) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
        }

        // Step 2: ALL section data in parallel (single round-trip)
        const [
          prospectsResult,
          allEnrollmentsResult,
          leadsResult,
          activitiesResult,
          notesResult,
          documentsResult,
          funnelResult,
        ] = await Promise.all([
          // Prospects (campaign enrollments with contact details)
          // Exclude converted prospects - they appear in Leads section instead
          adminClient
            .from('campaign_enrollments')
            .select(`
              *,
              contact:contacts!contact_id(id, first_name, last_name, email, phone, company_name, title)
            `)
            .eq('campaign_id', input.id)
            .neq('status', 'converted')
            .order('created_at', { ascending: false })
            .limit(100),

          // All enrollments count (for audience size - includes converted)
          adminClient
            .from('campaign_enrollments')
            .select('id, status', { count: 'exact' })
            .eq('campaign_id', input.id),

          // Leads linked to campaign (from leads table where campaign_id matches)
          adminClient
            .from('leads')
            .select('*, owner:user_profiles!owner_id(id, full_name, avatar_url), contact:contacts!contact_id(id, first_name, last_name, email, phone, company_name, title)')
            .eq('campaign_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100),

          // Activities for this campaign (all types)
          adminClient
            .from('activities')
            .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.id)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(100),

          // Notes (activities with type='note')
          adminClient
            .from('activities')
            .select('*, creator:user_profiles!created_by(id, full_name, avatar_url)')
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.id)
            .eq('activity_type', 'note')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(50),

          // Documents
          adminClient
            .from('campaign_documents')
            .select('*, uploader:user_profiles!uploaded_by(id, full_name)')
            .eq('campaign_id', input.id)
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50),

          // Funnel metrics via RPC
          adminClient.rpc('get_campaign_funnel', { p_campaign_id: input.id }),
        ])

        // Build funnel data
        const funnelData = funnelResult.data?.[0] || {
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
        }

        // Calculate stats from actual data (more accurate than cached values)
        const totalEnrollments = allEnrollmentsResult.count ?? allEnrollmentsResult.data?.length ?? 0
        const totalLeads = leadsResult.data?.length ?? 0
        // Count contacted prospects (status is 'contacted', 'engaged', 'responded', or 'converted')
        const contactedStatuses = ['contacted', 'engaged', 'responded', 'converted']
        const contactedCount = allEnrollmentsResult.data?.filter(
          (e: { status: string }) => contactedStatuses.includes(e.status)
        ).length ?? 0

        return {
          // Main entity data (camelCase transformed)
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          campaignType: campaign.campaign_type,
          goal: campaign.goal,
          channels: campaign.channels,
          targetCriteria: campaign.target_criteria,
          sequences: campaign.sequences,
          complianceSettings: campaign.compliance_settings,
          abTestConfig: campaign.ab_test_config,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          targetLeads: campaign.target_leads,
          targetMeetings: campaign.target_meetings,
          targetRevenue: campaign.target_revenue,
          budgetTotal: campaign.budget_total,
          budgetSpent: campaign.budget_spent,
          // Use calculated values from actual data, fall back to cached if needed
          audienceSize: totalEnrollments || campaign.audience_size || 0,
          prospectsContacted: contactedCount || campaign.prospects_contacted || 0,
          emailsOpened: campaign.emails_opened,
          linksClicked: campaign.links_clicked,
          prospectsResponded: campaign.prospects_responded,
          leadsGenerated: totalLeads || campaign.leads_generated || 0,
          meetingsBooked: campaign.meetings_booked,
          owner: campaign.owner,
          createdAt: campaign.created_at,
          updatedAt: campaign.updated_at,

          // Section data (for ONE database call pattern)
          sections: {
            prospects: {
              items: prospectsResult.data ?? [],
              total: prospectsResult.data?.length ?? 0,
            },
            leads: {
              items: leadsResult.data ?? [],
              total: leadsResult.data?.length ?? 0,
            },
            activities: {
              items: activitiesResult.data ?? [],
              total: activitiesResult.data?.length ?? 0,
            },
            notes: {
              items: notesResult.data ?? [],
              total: notesResult.data?.length ?? 0,
            },
            documents: {
              items: documentsResult.data ?? [],
              total: documentsResult.data?.length ?? 0,
            },
            sequence: {
              // Parse sequence steps from JSONB column (same as sequence.list)
              items: (() => {
                const sequences = campaign.sequences || {}
                const steps: Array<{
                  id: string
                  stepNumber: number
                  channel: string
                  subject?: string
                  templateId?: string
                  templateName?: string
                  dayOffset?: number
                  status: string
                }> = []
                let stepNumber = 1
                for (const [channel, channelData] of Object.entries(sequences)) {
                  const channelSteps = (channelData as ChannelSequenceData)?.steps || []
                  for (const step of channelSteps) {
                    steps.push({
                      id: `${channel}-${step.stepNumber || stepNumber}`,
                      stepNumber: step.stepNumber || stepNumber,
                      channel,
                      subject: step.subject,
                      templateId: step.templateId,
                      templateName: step.templateName,
                      dayOffset: step.dayOffset,
                      status: 'pending',
                    })
                    stepNumber++
                  }
                }
                steps.sort((a, b) => a.stepNumber - b.stepNumber)
                return steps
              })(),
              total: (() => {
                const sequences = campaign.sequences || {}
                let count = 0
                for (const [, channelData] of Object.entries(sequences)) {
                  count += (channelData as ChannelSequenceData)?.steps?.length || 0
                }
                return count
              })(),
            },
          },

          // Counts for sidebar badges
          counts: {
            prospects: prospectsResult.data?.length ?? 0,
            leads: leadsResult.data?.length ?? 0,
            activities: activitiesResult.data?.length ?? 0,
            notes: notesResult.data?.length ?? 0,
            documents: documentsResult.data?.length ?? 0,
            sequence: (() => {
              const sequences = campaign.sequences || {}
              let count = 0
              for (const [, channelData] of Object.entries(sequences)) {
                count += (channelData as ChannelSequenceData)?.steps?.length || 0
              }
              return count
            })(),
          },

          // Funnel metrics for analytics section
          funnel: funnelData,

          // Recent activities for overview section (first 10)
          recentActivities: (activitiesResult.data ?? []).slice(0, 10),
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
        // Step 3: Channels & Sequences
        channels: z.array(z.enum(['linkedin', 'email', 'phone', 'event', 'direct_mail'])),
        sequenceTemplateIds: z.array(z.string().uuid()).optional(),
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

        // Get the user's profile ID (user_profiles.id may differ from auth user id)
        const { data: userProfile } = await adminClient
          .from('user_profiles')
          .select('id')
          .eq('auth_id', user?.id)
          .single()

        const profileId = userProfile?.id ?? user?.id

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
            sequence_template_ids: input.sequenceTemplateIds ?? [],
            start_date: input.startDate,
            end_date: input.endDate,
            status,
            budget_total: input.budgetTotal,
            budget_currency: input.budgetCurrency,
            target_leads: input.targetLeads,
            target_meetings: input.targetMeetings,
            target_revenue: input.targetRevenue,
            compliance_settings: input.complianceSettings ?? { gdpr: true, canSpam: true, casl: true, includeUnsubscribe: true },
            owner_id: profileId,
            created_by: profileId,
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
            entity_type: 'campaign',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Campaign Created',
            description: `Campaign "${input.name}" created with ${input.channels.length} channels`,
            created_by: profileId,
          })

        return data
      }),

    // Update campaign
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(3).max(100).optional(),
        campaignType: z.string().optional(),
        goal: z.string().optional(),
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
        if (input.campaignType !== undefined) updateData.campaign_type = input.campaignType
        if (input.goal !== undefined) updateData.goal = input.goal
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

        // Log activity for campaign update
        const changedFields = Object.keys(updateData).filter(k => k !== 'updated_by')
        if (changedFields.length > 0) {
          await adminClient
            .from('activities')
            .insert({
              org_id: orgId,
              entity_type: 'campaign',
              entity_id: input.id,
              activity_type: 'note',
              subject: 'Campaign Updated',
              description: `Campaign updated. Changed fields: ${changedFields.join(', ')}`,
              created_by: user?.id,
            })
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

        // GUIDEWIRE PATTERN: Check for blocking activities before status change to closing statuses
        if (['completed', 'cancelled', 'archived'].includes(input.status)) {
          const { data: blockingActivities } = await adminClient
            .from('activities')
            .select(`
              id, subject, status, priority, due_date, assigned_to,
              user_profiles!activities_assigned_to_fkey (id, first_name, last_name)
            `)
            .eq('org_id', orgId)
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.id)
            .in('status', ['open', 'in_progress', 'scheduled'])
            .eq('is_blocking', true)
            .is('deleted_at', null)

          if (blockingActivities && blockingActivities.length > 0) {
            throw new TRPCError({
              code: 'PRECONDITION_FAILED',
              message: `Cannot change status to "${input.status}": ${blockingActivities.length} blocking activit${blockingActivities.length === 1 ? 'y' : 'ies'} must be completed first`,
              cause: {
                blockingActivities: blockingActivities.map(a => ({
                  id: a.id,
                  subject: a.subject,
                  status: a.status,
                  priority: a.priority,
                  dueDate: a.due_date,
                  assignedTo: a.user_profiles
                    ? {
                        id: (a.user_profiles as { id: string; first_name: string; last_name: string }).id,
                        firstName: (a.user_profiles as { id: string; first_name: string; last_name: string }).first_name,
                        lastName: (a.user_profiles as { id: string; first_name: string; last_name: string }).last_name,
                      }
                    : null,
                })),
              },
            })
          }
        }

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
          .from('activities')
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

    // Complete campaign with outcome
    complete: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        outcome: z.enum(['exceeded', 'met', 'partial', 'failed']),
        completionNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, user } = ctx
        const adminClient = getAdminClient()

        // Get campaign details for activity logging
        const { data: campaign } = await adminClient
          .from('campaigns')
          .select('name, leads_generated, target_leads, meetings_booked, target_meetings')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

        if (!campaign) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
        }

        // Update campaign status and outcome
        const { data, error } = await adminClient
          .from('campaigns')
          .update({
            status: 'completed',
            outcome: input.outcome,
            completion_notes: input.completionNotes,
            completed_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq('id', input.id)
          .eq('org_id', orgId)
          .select()
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        // Determine outcome label for activity
        const outcomeLabels: Record<string, string> = {
          exceeded: 'Exceeded Targets',
          met: 'Met Targets',
          partial: 'Partially Successful',
          failed: 'Did Not Meet Goals',
        }

        // Log completion activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'campaign',
            entity_id: input.id,
            activity_type: 'note',
            subject: 'Campaign Completed',
            description: `Campaign "${campaign.name}" completed with outcome: ${outcomeLabels[input.outcome]}. Leads: ${campaign.leads_generated}/${campaign.target_leads}, Meetings: ${campaign.meetings_booked}/${campaign.target_meetings}.${input.completionNotes ? ` Notes: ${input.completionNotes}` : ''}`,
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

    // Get a single enrollment (prospect) by ID
    getProspectById: orgProtectedProcedure
      .input(z.object({
        prospectId: z.string().uuid(),
        campaignId: z.string().uuid(),
      }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        const { data, error } = await adminClient
          .from('campaign_enrollments')
          .select(`
            *,
            contact:contacts!contact_id(id, first_name, last_name, email, phone, linkedin_url, company_name, title),
            campaign:campaigns!campaign_id(id, name, status)
          `)
          .eq('id', input.prospectId)
          .eq('campaign_id', input.campaignId)
          .eq('org_id', orgId)
          .single()

        if (error) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Prospect not found' })
        }

        return data
      }),

    // Get prospects (enrollments) for a campaign
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
          .from('campaign_enrollments')
          .select(`
            *,
            contact:contacts!contact_id(id, first_name, last_name, email, phone, linkedin_url, company_name, title),
            converted_lead:leads!converted_lead_id(*)
          `, { count: 'exact' })
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
          console.error('getProspects error:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        console.log('getProspects returned:', count, 'items for campaign:', input.campaignId)

        return {
          items: data ?? [],
          total: count ?? 0,
        }
      }),

    // Add prospects to campaign (creates contacts + enrollments)
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

        // Get existing enrollments for this campaign to avoid duplicates
        const { data: existingEnrollments } = await adminClient
          .from('campaign_enrollments')
          .select('contact:contacts!contact_id(email)')
          .eq('campaign_id', input.campaignId)
          .eq('org_id', orgId)

        const existingEmails = new Set(
          (existingEnrollments ?? [])
            .map(e => {
              const contactArray = e.contact as Array<{ email: string }> | null
              return contactArray?.[0]?.email?.toLowerCase()
            })
            .filter(Boolean)
        )

        // Filter out prospects that already exist in this campaign
        const newProspects = input.prospects.filter(
          p => !existingEmails.has(p.email.toLowerCase())
        )

        if (newProspects.length === 0) {
          return { added: 0 }
        }

        let addedCount = 0

        // Process each new prospect
        for (const p of newProspects) {
          // First, find or create the contact
          const { data: existingContact } = await adminClient
            .from('contacts')
            .select('id')
            .eq('email', p.email.toLowerCase())
            .eq('org_id', orgId)
            .is('deleted_at', null)
            .single()

          let contactId: string

          if (existingContact) {
            contactId = existingContact.id
            // Add 'prospect' to types if not already there
            await adminClient
              .from('contacts')
              .update({ 
                types: adminClient.rpc('array_append_unique', { arr: 'types', val: 'prospect' })
              })
              .eq('id', contactId)
          } else {
            // Create new contact
            const { data: newContact, error: contactError } = await adminClient
              .from('contacts')
              .insert({
                org_id: orgId,
                category: 'person',
                subtype: 'person_prospect',
                types: ['prospect'],
                first_name: p.firstName || null,
                last_name: p.lastName || null,
                email: p.email,
                phone: p.phone || null,
                linkedin_url: p.linkedinUrl || null,
                company_name: p.companyName || null,
                title: p.title || null,
                timezone: p.timezone || null,
                status: 'active',
              })
              .select('id')
              .single()

            if (contactError || !newContact) {
              console.error('Failed to create contact:', contactError)
              continue
            }
            contactId = newContact.id
          }

          // Create the enrollment
          const { data: enrollmentData, error: enrollError } = await adminClient
            .from('campaign_enrollments')
            .insert({
              org_id: orgId,
              campaign_id: input.campaignId,
              contact_id: contactId,
              primary_channel: input.channel,
              status: 'enrolled',
            })
            .select('id')
            .single()

          if (enrollError) {
            console.error('Failed to create enrollment:', enrollError)
          } else {
            console.log('Created enrollment:', enrollmentData?.id, 'for contact:', contactId)
            addedCount++
          }
        }

        // Log activity for prospect addition
        if (addedCount > 0) {
          await adminClient
            .from('activities')
            .insert({
              org_id: orgId,
              entity_type: 'campaign',
              entity_id: input.campaignId,
              activity_type: 'note',
              subject: 'Prospects Added',
              description: `${addedCount} ${addedCount === 1 ? 'prospect' : 'prospects'} enrolled via ${input.channel} channel`,
              created_by: ctx.user?.id,
            })
        }

        return { added: addedCount }
      }),

    // Update a prospect (enrollment + contact)
    updateProspect: orgProtectedProcedure
      .input(z.object({
        prospectId: z.string().uuid(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        linkedinUrl: z.string().optional(),
        companyName: z.string().optional(),
        companyIndustry: z.string().optional(),
        companySize: z.string().optional(),
        title: z.string().optional(),
        location: z.string().optional(),
        timezone: z.string().optional(),
        status: z.enum(['enrolled', 'contacted', 'engaged', 'responded', 'converted', 'unsubscribed', 'bounced']).optional(),
        responseType: z.enum(['positive', 'neutral', 'negative']).optional(),
        responseText: z.string().optional(),
        engagementScore: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx
        const adminClient = getAdminClient()

        // Get enrollment with contact
        const { data: existing, error: fetchError } = await adminClient
          .from('campaign_enrollments')
          .select('id, campaign_id, contact_id, responded_at')
          .eq('id', input.prospectId)
          .eq('org_id', orgId)
          .single()

        if (fetchError || !existing) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Enrollment not found' })
        }

        // Update contact data if any contact fields provided
        const contactUpdateData: Record<string, unknown> = {}
        if (input.firstName !== undefined) contactUpdateData.first_name = input.firstName
        if (input.lastName !== undefined) contactUpdateData.last_name = input.lastName
        if (input.email !== undefined) contactUpdateData.email = input.email
        if (input.phone !== undefined) contactUpdateData.phone = input.phone
        if (input.linkedinUrl !== undefined) contactUpdateData.linkedin_url = input.linkedinUrl
        if (input.companyName !== undefined) contactUpdateData.company_name = input.companyName
        if (input.title !== undefined) contactUpdateData.title = input.title
        if (input.timezone !== undefined) contactUpdateData.timezone = input.timezone

        if (Object.keys(contactUpdateData).length > 0) {
          await adminClient
            .from('contacts')
            .update(contactUpdateData)
            .eq('id', existing.contact_id)
        }

        // Update enrollment data
        const enrollmentUpdateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (input.status !== undefined) enrollmentUpdateData.status = input.status
        if (input.responseType !== undefined) enrollmentUpdateData.response_type = input.responseType
        if (input.responseText !== undefined) enrollmentUpdateData.response_text = input.responseText
        if (input.engagementScore !== undefined) enrollmentUpdateData.engagement_score = input.engagementScore

        // If response type is set, also set responded_at
        if (input.responseType && !existing.responded_at) {
          enrollmentUpdateData.responded_at = new Date().toISOString()
        }

        const { data, error } = await adminClient
          .from('campaign_enrollments')
          .update(enrollmentUpdateData)
          .eq('id', input.prospectId)
          .eq('org_id', orgId)
          .select('*, contact:contacts!contact_id(*)')
          .single()

        if (error) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return data
      }),

    // Convert prospect to lead (A03)
    convertProspectToLead: orgProtectedProcedure
      .input(z.object({
        prospectId: z.string().uuid(),
        // Lead data
        leadScore: z.number().min(0).max(100).optional(),
        interestLevel: z.enum(['hot', 'warm', 'cold']),
        // BANT - values match DB constraints
        budgetStatus: z.enum(['confirmed', 'likely', 'unclear', 'no_budget']).optional(),
        budgetNotes: z.string().optional(),
        authorityStatus: z.enum(['unknown', 'influencer', 'decision_maker', 'champion']).optional(),
        authorityNotes: z.string().optional(),
        needStatus: z.enum(['unknown', 'identified', 'defined', 'urgent']).optional(),
        needNotes: z.string().optional(),
        timelineStatus: z.enum(['unknown', 'long', 'medium', 'short']).optional(),
        timelineNotes: z.string().optional(),
        // Hiring details
        hiringNeeds: z.string().optional(),
        // DB constraint: immediate, high, medium, low
        urgency: z.enum(['immediate', 'high', 'medium', 'low']).default('medium'),
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

        // Get enrollment with contact data
        const { data: enrollment, error: enrollmentError } = await adminClient
          .from('campaign_enrollments')
          .select(`
            *,
            contact:contacts!contact_id(id, first_name, last_name, email, phone, linkedin_url, company_name, title),
            campaign:campaigns!campaign_id(id, name)
          `)
          .eq('id', input.prospectId)
          .eq('org_id', orgId)
          .single()

        if (enrollmentError || !enrollment) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Enrollment not found' })
        }

        // Check if already converted
        if (enrollment.converted_lead_id) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Prospect already converted to lead' })
        }

        const contact = enrollment.contact as { id: string; first_name: string; last_name: string; email: string; phone: string; linkedin_url: string; company_name: string; title: string } | null

        // Create lead with contact_id reference
        const { data: lead, error: leadError } = await adminClient
          .from('leads')
          .insert({
            org_id: orgId,
            lead_type: 'company',
            contact_id: contact?.id,  // Link to unified contact
            company_name: contact?.company_name,
            first_name: contact?.first_name,
            last_name: contact?.last_name,
            title: contact?.title,
            email: contact?.email,
            phone: contact?.phone,
            linkedin_url: contact?.linkedin_url,
            source: 'campaign',
            campaign_id: enrollment.campaign_id,
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

        // Update enrollment as converted
        await adminClient
          .from('campaign_enrollments')
          .update({
            converted_to_lead_at: new Date().toISOString(),
            converted_lead_id: lead.id,
            status: 'converted',
          })
          .eq('id', input.prospectId)

        // Add 'lead' to contact types
        if (contact?.id) {
          // Fetch current types and append 'lead' if not already present
          const { data: currentContact } = await adminClient
            .from('contacts')
            .select('types')
            .eq('id', contact.id)
            .single()

          const currentTypes = (currentContact?.types as string[]) || []
          if (!currentTypes.includes('lead')) {
            await adminClient
              .from('contacts')
              .update({ types: [...currentTypes, 'lead'] })
              .eq('id', contact.id)
          }
        }

        // Create follow-up task if next action specified
        if (input.nextAction && input.nextActionDate) {
          // Map urgency to lead_tasks priority (DB constraint: low, medium, high)
          const priorityMap: Record<string, string> = {
            immediate: 'high',
            high: 'high',
            medium: 'medium',
            low: 'low',
          }
          await adminClient
            .from('lead_tasks')
            .insert({
              org_id: orgId,
              lead_id: lead.id,
              title: input.nextAction,
              description: input.notes,
              due_date: input.nextActionDate,
              priority: priorityMap[input.urgency] || 'medium',
              assigned_to: user?.id,
              created_by: user?.id,
            })
        }

        // Log activity
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'lead',
            entity_id: lead.id,
            activity_type: 'note',
            subject: 'Lead Created from Campaign',
            description: `Lead created from campaign "${(enrollment.campaign as { name: string })?.name || 'Unknown'}". Interest level: ${input.interestLevel}`,
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

        // Get campaign name before deleting
        const { data: campaign } = await adminClient
          .from('campaigns')
          .select('name')
          .eq('id', input.id)
          .eq('org_id', orgId)
          .single()

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

        // Log activity for deletion
        if (campaign) {
          await adminClient
            .from('activities')
            .insert({
              org_id: orgId,
              entity_type: 'campaign',
              entity_id: input.id,
              activity_type: 'note',
              subject: 'Campaign Deleted',
              description: `Campaign "${campaign.name}" was deleted`,
              created_by: user?.id,
            })
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

        // Log activity for duplication
        await adminClient
          .from('activities')
          .insert({
            org_id: orgId,
            entity_type: 'campaign',
            entity_id: data.id,
            activity_type: 'note',
            subject: 'Campaign Duplicated',
            description: `Campaign duplicated from "${source.name}" as "${input.newName}"`,
            created_by: user?.id,
          })

        return data
      }),

    // ================================================
    // Campaign Documents CRUD
    // ================================================
    documents: router({
      list: orgProtectedProcedure
        .input(
          z.object({
            campaignId: z.string().uuid(),
            documentType: z.enum(['template', 'collateral', 'report', 'attachment', 'all']).default('all'),
            category: z.string().optional(),
            limit: z.number().min(1).max(100).default(50),
          })
        )
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          let query = adminClient
            .from('campaign_documents')
            .select('*, uploader:user_profiles!uploaded_by(id, full_name, avatar_url)')
            .eq('org_id', orgId)
            .eq('campaign_id', input.campaignId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(input.limit)

          if (input.documentType !== 'all') {
            query = query.eq('document_type', input.documentType)
          }
          if (input.category) {
            query = query.eq('category', input.category)
          }

          const { data, error } = await query
          if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          return data ?? []
        }),

      getById: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          const { data, error } = await adminClient
            .from('campaign_documents')
            .select('*, uploader:user_profiles!uploaded_by(id, full_name, avatar_url)')
            .eq('org_id', orgId)
            .eq('id', input.id)
            .is('deleted_at', null)
            .single()

          if (error || !data) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' })
          }
          return data
        }),

      create: orgProtectedProcedure
        .input(
          z.object({
            campaignId: z.string().uuid(),
            name: z.string().min(1).max(255),
            description: z.string().optional(),
            documentType: z.enum(['template', 'collateral', 'report', 'attachment']).default('attachment'),
            category: z.string().optional(),
            fileUrl: z.string().url(),
            fileName: z.string(),
            fileSize: z.number().int().positive(),
            mimeType: z.string(),
            templateVariables: z.record(z.any()).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { orgId, user } = ctx
          const adminClient = getAdminClient()

          const { data, error } = await adminClient
            .from('campaign_documents')
            .insert({
              campaign_id: input.campaignId,
              org_id: orgId,
              name: input.name,
              description: input.description,
              document_type: input.documentType,
              category: input.category,
              file_url: input.fileUrl,
              file_name: input.fileName,
              file_size: input.fileSize,
              mime_type: input.mimeType,
              template_variables: input.templateVariables,
              uploaded_by: user?.id,
            })
            .select()
            .single()

          if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

          // Log activity
          await adminClient.from('activities').insert({
            org_id: orgId,
            entity_type: 'campaign',
            entity_id: input.campaignId,
            activity_type: 'note',
            subject: 'Document Uploaded',
            description: `"${input.name}" (${input.documentType}) uploaded to campaign`,
            created_by: user?.id,
          })

          return data
        }),

      update: orgProtectedProcedure
        .input(
          z.object({
            id: z.string().uuid(),
            name: z.string().min(1).max(255).optional(),
            description: z.string().optional(),
            category: z.string().optional(),
            templateVariables: z.record(z.any()).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const { orgId, user } = ctx
          const adminClient = getAdminClient()
          const { id, ...updates } = input

          const cleanUpdates = Object.fromEntries(
            Object.entries({
              name: updates.name,
              description: updates.description,
              category: updates.category,
              template_variables: updates.templateVariables,
            }).filter(([, v]) => v !== undefined)
          )

          const { data, error } = await adminClient
            .from('campaign_documents')
            .update(cleanUpdates)
            .eq('org_id', orgId)
            .eq('id', id)
            .select('*, campaign_id')
            .single()

          if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

          // Log activity
          await adminClient.from('activities').insert({
            org_id: orgId,
            entity_type: 'campaign',
            entity_id: data.campaign_id,
            activity_type: 'note',
            subject: 'Document Updated',
            description: `"${data.name}" document updated`,
            created_by: user?.id,
          })

          return data
        }),

      delete: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user } = ctx
          const adminClient = getAdminClient()

          // Get document first for activity log
          const { data: doc } = await adminClient
            .from('campaign_documents')
            .select('name, campaign_id')
            .eq('org_id', orgId)
            .eq('id', input.id)
            .single()

          // Soft delete
          const { error } = await adminClient
            .from('campaign_documents')
            .update({ deleted_at: new Date().toISOString() })
            .eq('org_id', orgId)
            .eq('id', input.id)

          if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })

          // Log activity
          if (doc) {
            await adminClient.from('activities').insert({
              org_id: orgId,
              entity_type: 'campaign',
              entity_id: doc.campaign_id,
              activity_type: 'note',
              subject: 'Document Deleted',
              description: `"${doc.name}" document removed from campaign`,
              created_by: user?.id,
            })
          }

          return { success: true }
        }),

      incrementUsage: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          // Update last used timestamp (usage_count requires DB trigger/function)
          const { error } = await adminClient
            .from('campaign_documents')
            .update({
              last_used_at: new Date().toISOString(),
            })
            .eq('org_id', orgId)
            .eq('id', input.id)

          // If update fails silently, it's okay
          return { success: !error }
        }),
    }),

    // ================================================
    // Campaign Sequence Stats
    // ================================================
    getSequenceStats: orgProtectedProcedure
      .input(z.object({ campaignId: z.string().uuid() }))
      .query(async ({ input }) => {
        const adminClient = getAdminClient()

        // Aggregate stats from campaign_sequence_logs
        const { data, error } = await adminClient
          .from('campaign_sequence_logs')
          .select('channel, action_type')
          .eq('campaign_id', input.campaignId)

        if (error) {
          return {}
        }

        // Group by channel and calculate stats
        const stats: Record<string, { sent: number; opens: number; replies: number }> = {}

        for (const log of data || []) {
          if (!stats[log.channel]) {
            stats[log.channel] = { sent: 0, opens: 0, replies: 0 }
          }

          switch (log.action_type) {
            case 'sent':
            case 'delivered':
              stats[log.channel].sent++
              break
            case 'opened':
            case 'viewed':
              stats[log.channel].opens++
              break
            case 'replied':
            case 'responded':
              stats[log.channel].replies++
              break
          }
        }

        return stats
      }),

    // ================================================
    // Campaign Sequence Management
    // CRUD operations for campaign sequence steps
    // ================================================
    sequence: router({
      // List sequence steps for a campaign (from sequences JSONB column)
      list: orgProtectedProcedure
        .input(z.object({ campaignId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const adminClient = getAdminClient()

          // Get campaign with sequences
          const { data: campaign, error } = await adminClient
            .from('campaigns')
            .select('id, sequences, sequence_template_ids')
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)
            .single()

          if (error || !campaign) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
          }

          // Parse sequences JSONB
          const sequences = campaign.sequences || {}
          const steps: Array<{
            id: string
            stepNumber: number
            channel: string
            subject?: string
            templateId?: string
            templateName?: string
            dayOffset: number
            status: string
          }> = []

          // Convert JSONB structure to flat array of steps
          let stepNumber = 1
          for (const [channel, channelData] of Object.entries(sequences)) {
            const channelSteps = (channelData as ChannelSequenceData)?.steps || []
            for (const step of channelSteps) {
              steps.push({
                id: `${channel}-${step.stepNumber || stepNumber}`,
                stepNumber: step.stepNumber || stepNumber,
                channel,
                subject: step.subject,
                templateId: step.templateId,
                templateName: step.templateName,
                dayOffset: step.dayOffset || 0,
                status: 'pending',
              })
              stepNumber++
            }
          }

          // Sort by stepNumber
          steps.sort((a, b) => a.stepNumber - b.stepNumber)

          return { steps, templateIds: campaign.sequence_template_ids || [] }
        }),

      // Add a step to a campaign sequence
      addStep: orgProtectedProcedure
        .input(z.object({
          campaignId: z.string().uuid(),
          channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
          step: z.object({
            stepNumber: z.number().optional(),
            dayOffset: z.number().default(1),
            subject: z.string().optional(),
            templateId: z.string().optional(),
            templateName: z.string().optional(),
          }),
        }))
        .mutation(async ({ ctx, input }) => {
          const adminClient = getAdminClient()

          // Get current sequences
          const { data: campaign, error: fetchError } = await adminClient
            .from('campaigns')
            .select('sequences')
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)
            .single()

          if (fetchError || !campaign) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
          }

          const sequences = campaign.sequences || {}
          const channelData = sequences[input.channel] || { steps: [], stopConditions: ['reply'] }
          const steps = channelData.steps || []

          // Add new step
          const newStepNumber = input.step.stepNumber || steps.length + 1
          steps.push({
            stepNumber: newStepNumber,
            dayOffset: input.step.dayOffset,
            subject: input.step.subject,
            templateId: input.step.templateId,
            templateName: input.step.templateName,
          })

          // Update sequences
          sequences[input.channel] = { ...channelData, steps }

          const { error: updateError } = await adminClient
            .from('campaigns')
            .update({ sequences, updated_at: new Date().toISOString() })
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)

          if (updateError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
          }

          return { success: true, stepNumber: newStepNumber }
        }),

      // Update a specific step
      updateStep: orgProtectedProcedure
        .input(z.object({
          campaignId: z.string().uuid(),
          channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
          stepNumber: z.number(),
          updates: z.object({
            dayOffset: z.number().optional(),
            subject: z.string().optional(),
            templateId: z.string().optional(),
            templateName: z.string().optional(),
          }),
        }))
        .mutation(async ({ ctx, input }) => {
          const adminClient = getAdminClient()

          // Get current sequences
          const { data: campaign, error: fetchError } = await adminClient
            .from('campaigns')
            .select('sequences')
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)
            .single()

          if (fetchError || !campaign) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
          }

          const sequences = campaign.sequences || {}
          const channelData = sequences[input.channel]
          if (!channelData?.steps) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Channel or steps not found' })
          }

          // Find and update step
          const stepIndex = channelData.steps.findIndex((s: SequenceStep) => s.stepNumber === input.stepNumber)
          if (stepIndex === -1) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Step not found' })
          }

          channelData.steps[stepIndex] = {
            ...channelData.steps[stepIndex],
            ...input.updates,
          }
          sequences[input.channel] = channelData

          const { error: updateError } = await adminClient
            .from('campaigns')
            .update({ sequences, updated_at: new Date().toISOString() })
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)

          if (updateError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
          }

          return { success: true }
        }),

      // Delete a step
      deleteStep: orgProtectedProcedure
        .input(z.object({
          campaignId: z.string().uuid(),
          channel: z.enum(['email', 'linkedin', 'phone', 'sms']),
          stepNumber: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
          const adminClient = getAdminClient()

          // Get current sequences
          const { data: campaign, error: fetchError } = await adminClient
            .from('campaigns')
            .select('sequences')
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)
            .single()

          if (fetchError || !campaign) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' })
          }

          const sequences = campaign.sequences || {}
          const channelData = sequences[input.channel]
          if (!channelData?.steps) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Channel or steps not found' })
          }

          // Remove step and renumber remaining
          channelData.steps = channelData.steps
            .filter((s: SequenceStep) => s.stepNumber !== input.stepNumber)
            .map((s: SequenceStep, idx: number) => ({ ...s, stepNumber: idx + 1 }))

          sequences[input.channel] = channelData

          const { error: updateError } = await adminClient
            .from('campaigns')
            .update({ sequences, updated_at: new Date().toISOString() })
            .eq('id', input.campaignId)
            .eq('org_id', ctx.orgId)

          if (updateError) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: updateError.message })
          }

          return { success: true }
        }),

      // Get detailed performance for sequence steps
      getPerformance: orgProtectedProcedure
        .input(z.object({
          campaignId: z.string().uuid(),
          channel: z.enum(['email', 'linkedin', 'phone', 'sms']).optional(),
        }))
        .query(async ({ input }) => {
          const adminClient = getAdminClient()

          let query = adminClient
            .from('campaign_sequence_logs')
            .select('step_number, channel, action_type')
            .eq('campaign_id', input.campaignId)

          if (input.channel) {
            query = query.eq('channel', input.channel)
          }

          const { data, error } = await query

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          // Group by step and channel
          const performance: Record<string, Record<string, number>> = {}

          for (const log of data || []) {
            const key = `${log.channel}-${log.step_number}`
            if (!performance[key]) {
              performance[key] = {
                stepNumber: log.step_number,
                channel: log.channel,
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                replied: 0,
                bounced: 0,
              }
            }

            const stat = performance[key]
            switch (log.action_type) {
              case 'sent': stat.sent++; break
              case 'delivered': stat.delivered++; break
              case 'opened': case 'viewed': stat.opened++; break
              case 'clicked': stat.clicked++; break
              case 'replied': case 'responded': stat.replied++; break
              case 'bounced': case 'failed': stat.bounced++; break
            }
          }

          return Object.values(performance)
        }),
    }),

    // ================================================
    // CAMPAIGN ACTIVITIES (Unified Workflow System)
    // Uses the main activities table with full workflow features
    // ================================================
    workflowActivities: router({
      // List activities for a campaign (from unified activities table)
      list: orgProtectedProcedure
        .input(z.object({
          campaignId: z.string().uuid(),
          status: z.enum(['open', 'in_progress', 'completed', 'skipped', 'canceled', 'blocked', 'all']).default('all'),
          includeCompleted: z.boolean().default(true),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        }))
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          let query = adminClient
            .from('activities')
            .select(`
              *,
              assigned_user:user_profiles!assigned_to(id, full_name, avatar_url),
              created_by_user:user_profiles!created_by(id, full_name, avatar_url),
              pattern:activity_patterns!pattern_id(id, code, name, category, icon, color)
            `, { count: 'exact' })
            .eq('org_id', orgId)
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.campaignId)
            .order('created_at', { ascending: false })

          if (input.status !== 'all') {
            query = query.eq('status', input.status)
          } else if (!input.includeCompleted) {
            query = query.in('status', ['open', 'in_progress', 'blocked'])
          }

          query = query.range(input.offset, input.offset + input.limit - 1)

          const { data, error, count } = await query

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          // Calculate overdue status
          const now = new Date()
          const items = (data ?? []).map(activity => {
            const dueDate = activity.due_date ? new Date(activity.due_date) : null
            const escalationDate = activity.escalation_date ? new Date(activity.escalation_date) : null
            
            return {
              id: activity.id,
              subject: activity.subject,
              description: activity.description,
              instructions: activity.instructions,
              checklist: activity.checklist,
              checklistProgress: activity.checklist_progress,
              status: activity.status,
              priority: activity.priority,
              category: activity.category,
              activityType: activity.activity_type,
              patternCode: activity.pattern_code,
              pattern: activity.pattern,
              dueDate: activity.due_date,
              escalationDate: activity.escalation_date,
              isOverdue: dueDate ? dueDate < now && activity.status !== 'completed' : false,
              isEscalated: escalationDate ? escalationDate < now && activity.status !== 'completed' : false,
              escalationCount: activity.escalation_count,
              assignedTo: activity.assigned_user,
              createdBy: activity.created_by_user,
              completedAt: activity.completed_at,
              outcome: activity.outcome,
              outcomeNotes: activity.outcome_notes,
              autoCreated: activity.auto_created,
              predecessorActivityId: activity.predecessor_activity_id,
              createdAt: activity.created_at,
              updatedAt: activity.updated_at,
            }
          })

          return {
            items,
            total: count ?? 0,
            // Summary counts
            summary: {
              open: items.filter(a => a.status === 'open').length,
              inProgress: items.filter(a => a.status === 'in_progress').length,
              completed: items.filter(a => a.status === 'completed').length,
              overdue: items.filter(a => a.isOverdue).length,
              escalated: items.filter(a => a.isEscalated).length,
            },
          }
        }),

      // Get single activity by ID
      getById: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          const { data, error } = await adminClient
            .from('activities')
            .select(`
              *,
              assigned_user:user_profiles!assigned_to(id, full_name, avatar_url, email),
              created_by_user:user_profiles!created_by(id, full_name, avatar_url),
              pattern:activity_patterns!pattern_id(id, code, name, description, category, icon, color, instructions, checklist)
            `)
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single()

          if (error) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity not found' })
          }

          return data
        }),

      // Create manual activity (ad-hoc, not from workflow)
      create: orgProtectedProcedure
        .input(z.object({
          campaignId: z.string().uuid(),
          // Activity details
          subject: z.string().min(3).max(200),
          description: z.string().max(2000).optional(),
          activityType: z.enum(['task', 'call', 'email', 'meeting', 'note', 'follow_up', 'review']).default('task'),
          priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
          category: z.string().optional(),
          // Pattern (optional - for using predefined pattern)
          patternCode: z.string().optional(),
          // Assignment
          assignedTo: z.string().uuid().optional(),
          // Dates
          dueDate: z.string().datetime().optional(),
          // Checklist (optional)
          checklist: z.array(z.object({
            item: z.string(),
            required: z.boolean().default(false),
          })).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user } = ctx
          const adminClient = getAdminClient()

          // Get pattern if specified
          let pattern = null
          if (input.patternCode) {
            const { data: patternData } = await adminClient
              .from('activity_patterns')
              .select('*')
              .eq('code', input.patternCode)
              .or(`org_id.is.null,org_id.eq.${orgId}`)
              .order('org_id', { nullsFirst: false })
              .limit(1)
              .single()

            pattern = patternData
          }

          // Calculate due date if not provided but pattern has target_days
          let dueDate = input.dueDate ? new Date(input.dueDate) : null
          let escalationDate: Date | null = null

          if (!dueDate && pattern?.target_days) {
            dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + pattern.target_days)
          }

          if (dueDate && pattern?.escalation_days) {
            escalationDate = new Date()
            escalationDate.setDate(escalationDate.getDate() + pattern.escalation_days)
          }

          // Create the activity
          const { data, error } = await adminClient
            .from('activities')
            .insert({
              org_id: orgId,
              entity_type: 'campaign',
              entity_id: input.campaignId,
              subject: input.subject,
              description: input.description,
              activity_type: input.activityType,
              priority: input.priority,
              category: input.category || pattern?.category,
              pattern_code: input.patternCode,
              pattern_id: pattern?.id,
              instructions: pattern?.instructions,
              checklist: input.checklist || pattern?.checklist,
              due_date: dueDate?.toISOString(),
              escalation_date: escalationDate?.toISOString(),
              assigned_to: input.assignedTo || user?.id,
              status: 'open',
              auto_created: false,
              created_by: user?.id,
            })
            .select(`
              *,
              assigned_user:user_profiles!assigned_to(id, full_name, avatar_url)
            `)
            .single()

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data
        }),

      // Start working on activity (change status to in_progress)
      start: orgProtectedProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user, supabase } = ctx
          const adminClient = getAdminClient()

          // Get current activity
          const { data: activity, error: fetchError } = await adminClient
            .from('activities')
            .select('status')
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single()

          if (fetchError || !activity) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Activity not found' })
          }

          if (activity.status !== 'open') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Activity must be open to start' })
          }

          const { data, error } = await supabase
            .from('activities')
            .update({
              status: 'in_progress',
              started_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
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

      // Complete an activity (triggers successors via DB function)
      complete: orgProtectedProcedure
        .input(z.object({
          id: z.string().uuid(),
          outcome: z.enum(['completed', 'positive', 'neutral', 'negative', 'deferred']).default('completed'),
          outcomeNotes: z.string().max(2000).optional(),
          checklistProgress: z.record(z.boolean()).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { user } = ctx
          const adminClient = getAdminClient()

          // Use DB function to complete and trigger successors
          const { data: results, error } = await adminClient
            .rpc('complete_campaign_activity', {
              p_activity_id: input.id,
              p_completed_by: user?.id,
              p_outcome: input.outcome,
              p_outcome_notes: input.outcomeNotes,
            })

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          // Update checklist progress if provided
          if (input.checklistProgress) {
            await adminClient
              .from('activities')
              .update({ checklist_progress: input.checklistProgress })
              .eq('id', input.id)
          }

          // Get the updated activity
          const { data: activity } = await adminClient
            .from('activities')
            .select(`
              *,
              assigned_user:user_profiles!assigned_to(id, full_name, avatar_url)
            `)
            .eq('id', input.id)
            .single()

          // Format successors info
          const successors = (results ?? [])
            .filter((r: { successor_created: boolean }) => r.successor_created)
            .map((r: { successor_id: string; successor_name: string }) => ({
              id: r.successor_id,
              name: r.successor_name,
            }))

          return {
            activity,
            successorsCreated: successors.length,
            successors,
          }
        }),

      // Skip an activity
      skip: orgProtectedProcedure
        .input(z.object({
          id: z.string().uuid(),
          reason: z.string().max(500).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user, supabase } = ctx

          const { data, error } = await supabase
            .from('activities')
            .update({
              status: 'skipped',
              skip_reason: input.reason,
              skipped_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
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

      // Reassign activity to another user
      reassign: orgProtectedProcedure
        .input(z.object({
          id: z.string().uuid(),
          assignedTo: z.string().uuid(),
          notes: z.string().max(500).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user, supabase } = ctx
          const adminClient = getAdminClient()

          // Get current assignee
          const { data: current } = await adminClient
            .from('activities')
            .select('assigned_to')
            .eq('id', input.id)
            .eq('org_id', orgId)
            .single()

          const { data, error } = await supabase
            .from('activities')
            .update({
              assigned_to: input.assignedTo,
              assigned_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              updated_by: user?.id,
            })
            .eq('id', input.id)
            .eq('org_id', orgId)
            .select(`
              *,
              assigned_user:user_profiles!assigned_to(id, full_name, avatar_url)
            `)
            .single()

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data
        }),

      // Update activity (subject, description, due date, etc.)
      update: orgProtectedProcedure
        .input(z.object({
          id: z.string().uuid(),
          subject: z.string().min(3).max(200).optional(),
          description: z.string().max(2000).optional(),
          priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
          dueDate: z.string().datetime().optional().nullable(),
          escalationDate: z.string().datetime().optional().nullable(),
          checklistProgress: z.record(z.boolean()).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user, supabase } = ctx
          const { id, ...updateFields } = input

          const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          }

          if (updateFields.subject !== undefined) updateData.subject = updateFields.subject
          if (updateFields.description !== undefined) updateData.description = updateFields.description
          if (updateFields.priority !== undefined) updateData.priority = updateFields.priority
          if (updateFields.dueDate !== undefined) updateData.due_date = updateFields.dueDate
          if (updateFields.escalationDate !== undefined) updateData.escalation_date = updateFields.escalationDate
          if (updateFields.checklistProgress !== undefined) updateData.checklist_progress = updateFields.checklistProgress

          const { data, error } = await supabase
            .from('activities')
            .update(updateData)
            .eq('id', id)
            .eq('org_id', orgId)
            .select(`
              *,
              assigned_user:user_profiles!assigned_to(id, full_name, avatar_url)
            `)
            .single()

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data
        }),

      // Get available activity patterns for campaigns
      getPatterns: orgProtectedProcedure
        .query(async ({ ctx }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          const { data, error } = await adminClient
            .from('activity_patterns')
            .select('*')
            .eq('entity_type', 'campaign')
            .eq('is_active', true)
            .or(`org_id.is.null,org_id.eq.${orgId}`)
            .order('category')
            .order('display_order')

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data ?? []
        }),

      // Get campaign team members for assignment
      getAssignees: orgProtectedProcedure
        .input(z.object({ campaignId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          // Get campaign owner
          const { data: campaign } = await adminClient
            .from('campaigns')
            .select('owner_id, owner:user_profiles!owner_id(id, full_name, avatar_url)')
            .eq('id', input.campaignId)
            .single()

          // Get team members (simplified - get all users in org for now)
          const { data: teamMembers } = await adminClient
            .from('user_profiles')
            .select('id, full_name, avatar_url')
            .eq('org_id', orgId)
            .eq('status', 'active')
            .order('full_name')
            .limit(50)

          return {
            owner: campaign?.owner,
            teamMembers: teamMembers ?? [],
          }
        }),

      // Get workplan instance for campaign
      getWorkplan: orgProtectedProcedure
        .input(z.object({ campaignId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          const { data, error } = await adminClient
            .from('workplan_instances')
            .select(`
              *,
              template:workplan_templates!template_id(id, code, name, description)
            `)
            .eq('org_id', orgId)
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.campaignId)
            .single()

          if (error && error.code !== 'PGRST116') {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return data
        }),

      // Manually trigger workplan creation (if not auto-created)
      createWorkplan: orgProtectedProcedure
        .input(z.object({ campaignId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const { orgId, user } = ctx
          const adminClient = getAdminClient()

          // Check if workplan already exists
          const { data: existing } = await adminClient
            .from('workplan_instances')
            .select('id')
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.campaignId)
            .single()

          if (existing) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Workplan already exists for this campaign' })
          }

          // Call DB function to create workplan
          const { data, error } = await adminClient
            .rpc('create_campaign_workplan', {
              p_campaign_id: input.campaignId,
              p_org_id: orgId,
              p_created_by: user?.id,
            })

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return { workplanInstanceId: data }
        }),

      // Check and update campaign status based on activities
      checkStatus: orgProtectedProcedure
        .input(z.object({ campaignId: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          const { data, error } = await adminClient
            .rpc('check_campaign_status_progression', {
              p_campaign_id: input.campaignId,
              p_org_id: orgId,
            })

          if (error) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
          }

          return { status: data }
        }),

      // Get activity progress summary
      getProgress: orgProtectedProcedure
        .input(z.object({ campaignId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
          const { orgId } = ctx
          const adminClient = getAdminClient()

          // Get all activities for this campaign
          const { data: activities } = await adminClient
            .from('activities')
            .select('id, pattern_code, status, auto_created, due_date, completed_at')
            .eq('org_id', orgId)
            .eq('entity_type', 'campaign')
            .eq('entity_id', input.campaignId)

          if (!activities) return { phases: [], overall: { total: 0, completed: 0, percentage: 0 } }

          // Define workflow phases
          const phases = [
            { phase: 'setup', label: 'Setup', patterns: ['campaign_setup'] },
            { phase: 'sourcing', label: 'Sourcing', patterns: ['campaign_build_list'] },
            { phase: 'configuration', label: 'Configuration', patterns: ['campaign_configure_sequences'] },
            { phase: 'launch', label: 'Launch', patterns: ['campaign_review_launch'] },
            { phase: 'monitoring', label: 'Monitoring', patterns: ['campaign_7_day_review', 'campaign_30_day_review', 'campaign_performance_review'] },
          ]

          const phaseProgress = phases.map(phase => {
            const phaseActivities = activities.filter(a => 
              a.pattern_code && phase.patterns.includes(a.pattern_code)
            )
            const completed = phaseActivities.filter(a => a.status === 'completed').length
            const total = phaseActivities.length

            return {
              phase: phase.phase,
              label: phase.label,
              total,
              completed,
              percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
              status: total === 0 ? 'pending' : completed === total ? 'completed' : completed > 0 ? 'in_progress' : 'pending',
            }
          })

          // Overall progress
          const workflowActivities = activities.filter(a => a.auto_created)
          const completedWorkflow = workflowActivities.filter(a => a.status === 'completed').length

          return {
            phases: phaseProgress,
            overall: {
              total: workflowActivities.length,
              completed: completedWorkflow,
              percentage: workflowActivities.length > 0 
                ? Math.round((completedWorkflow / workflowActivities.length) * 100) 
                : 0,
            },
            // Additional metrics
            metrics: {
              totalActivities: activities.length,
              completedActivities: activities.filter(a => a.status === 'completed').length,
              overdueActivities: activities.filter(a => {
                if (a.status === 'completed') return false
                if (!a.due_date) return false
                return new Date(a.due_date) < new Date()
              }).length,
              manualActivities: activities.filter(a => !a.auto_created).length,
            },
          }
        }),
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
          .from('activities')
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
          const userArray = c.user as Array<{ id: string; full_name: string; avatar_url: string | null }> | null
          const user = userArray?.[0]
          const existing = leaderboard.get(userId) || {
            userId,
            name: user?.full_name || 'Unknown',
            avatarUrl: user?.avatar_url || null,
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
