/**
 * @deprecated LEGACY ROUTER - DO NOT USE FOR NEW DEVELOPMENT
 *
 * This router is deprecated and will be removed in a future version.
 * Use the unified rates router instead: `src/server/routers/rates.ts`
 *
 * Migration guide:
 * - contactRateCards.list           -> rates.listEntityRates (with entity_type='contact')
 * - contactRateCards.getById        -> rates.getEntityRate
 * - contactRateCards.getByContact   -> rates.listEntityRates (with entityId filter)
 * - contactRateCards.getDefaultRate -> rates.getCurrentRate
 * - contactRateCards.getByClient    -> rates.listEntityRates (with contextClientId filter)
 * - contactRateCards.create         -> rates.createEntityRate (with entity_type='contact')
 * - contactRateCards.update         -> rates.updateEntityRate
 * - contactRateCards.delete         -> rates.deleteEntityRate
 * - contactRateCards.deactivate     -> rates.updateEntityRate (with is_current=false)
 * - contactRateCards.setDefault     -> rates.updateEntityRate (with is_current=true)
 * - contactRateCards.stats          -> rates.getStats
 *
 * Database migration: Legacy views are available at contact_rate_cards_legacy
 * that map to the new entity_rates table.
 *
 * @see src/server/routers/rates.ts
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'

// ============================================
// @deprecated - Use rates.ts instead
// ============================================

// ============================================
// INPUT SCHEMAS
// ============================================

const rateTypeEnum = z.enum([
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'annual',
  'fixed',
  'retainer',
  'project'
])

const currencyEnum = z.enum([
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'INR'
])

const rateCardInput = z.object({
  contactId: z.string().uuid(),
  // Rate identification
  rateName: z.string().min(1), // "Standard Hourly", "Senior Developer Rate", etc.
  rateType: rateTypeEnum,
  currency: currencyEnum.default('USD'),
  // Rate values
  billRate: z.number().min(0),
  payRate: z.number().min(0).optional(),
  markupPercent: z.number().min(0).max(100).optional(),
  // Context
  skillCategory: z.string().optional(), // "Java Developer", "Project Manager"
  jobLevel: z.string().optional(), // "Junior", "Senior", "Lead"
  clientId: z.string().uuid().optional(), // Specific client rate
  // Validity
  effectiveDate: z.string(), // ISO date
  expirationDate: z.string().optional(),
  isDefault: z.boolean().default(false),
  // Notes
  notes: z.string().optional(),
})


// ============================================
// HELPER FUNCTIONS
// ============================================

function transformRateCard(rateCard: Record<string, unknown>) {
  return {
    id: rateCard.id as string,
    contactId: rateCard.contact_id as string,
    rateName: rateCard.rate_name as string,
    rateType: rateCard.rate_type as string,
    currency: rateCard.currency as string,
    billRate: rateCard.bill_rate as number,
    payRate: rateCard.pay_rate as number | null,
    markupPercent: rateCard.markup_percent as number | null,
    skillCategory: rateCard.skill_category as string | null,
    jobLevel: rateCard.job_level as string | null,
    clientId: rateCard.client_id as string | null,
    effectiveDate: rateCard.effective_date as string,
    expirationDate: rateCard.expiration_date as string | null,
    isDefault: rateCard.is_default as boolean,
    isActive: rateCard.is_active as boolean,
    notes: rateCard.notes as string | null,
    createdAt: rateCard.created_at as string,
    updatedAt: rateCard.updated_at as string,
    createdBy: rateCard.created_by as string | null,
    // Joined data
    contact: rateCard.contact,
    client: rateCard.client,
  }
}

// ============================================
// ROUTER
// ============================================

export const contactRateCardsRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      rateType: rateTypeEnum.optional(),
      currency: currencyEnum.optional(),
      clientId: z.string().uuid().optional(),
      skillCategory: z.string().optional(),
      jobLevel: z.string().optional(),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
      activeOnly: z.boolean().optional(), // Only currently effective rates
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['rate_name', 'bill_rate', 'effective_date', 'created_at']).default('effective_date'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_rate_cards')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype),
          client:contacts!client_id(id, company_name, subtype)
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Filter by contact
      if (input.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      // Filter by rate type
      if (input.rateType) {
        query = query.eq('rate_type', input.rateType)
      }

      // Filter by currency
      if (input.currency) {
        query = query.eq('currency', input.currency)
      }

      // Filter by client
      if (input.clientId) {
        query = query.eq('client_id', input.clientId)
      }

      // Filter by skill category
      if (input.skillCategory) {
        query = query.ilike('skill_category', `%${input.skillCategory}%`)
      }

      // Filter by job level
      if (input.jobLevel) {
        query = query.eq('job_level', input.jobLevel)
      }

      // Filter default rates
      if (input.isDefault !== undefined) {
        query = query.eq('is_default', input.isDefault)
      }

      // Filter active status
      if (input.isActive !== undefined) {
        query = query.eq('is_active', input.isActive)
      }

      // Filter only currently effective rates
      if (input.activeOnly) {
        const today = new Date().toISOString().split('T')[0]
        query = query
          .eq('is_active', true)
          .lte('effective_date', today)
          .or(`expiration_date.is.null,expiration_date.gte.${today}`)
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list contact rate cards:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformRateCard) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single rate card
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('contact_rate_cards')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype),
          client:contacts!client_id(id, company_name, subtype)
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

  // ==========================================
  // GET BY CONTACT - All rate cards for a contact
  // ==========================================
  getByContact: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      activeOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_rate_cards')
        .select(`
          *,
          client:contacts!client_id(id, company_name, subtype)
        `)
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .is('deleted_at', null)

      if (input.activeOnly) {
        const today = new Date().toISOString().split('T')[0]
        query = query
          .eq('is_active', true)
          .lte('effective_date', today)
          .or(`expiration_date.is.null,expiration_date.gte.${today}`)
      }

      query = query
        .order('is_default', { ascending: false })
        .order('effective_date', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get rate cards by contact:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformRateCard) ?? []
    }),

  // ==========================================
  // GET DEFAULT RATE - Get default rate for a contact
  // ==========================================
  getDefaultRate: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid(),
      clientId: z.string().uuid().optional(), // Get client-specific rate if available
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const today = new Date().toISOString().split('T')[0]

      // First try to find client-specific rate if clientId provided
      if (input.clientId) {
        const { data: clientRate } = await adminClient
          .from('contact_rate_cards')
          .select('*')
          .eq('org_id', orgId)
          .eq('contact_id', input.contactId)
          .eq('client_id', input.clientId)
          .eq('is_active', true)
          .lte('effective_date', today)
          .or(`expiration_date.is.null,expiration_date.gte.${today}`)
          .is('deleted_at', null)
          .order('effective_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (clientRate) {
          return transformRateCard(clientRate)
        }
      }

      // Fall back to default rate
      const { data, error } = await adminClient
        .from('contact_rate_cards')
        .select('*')
        .eq('org_id', orgId)
        .eq('contact_id', input.contactId)
        .eq('is_default', true)
        .eq('is_active', true)
        .lte('effective_date', today)
        .or(`expiration_date.is.null,expiration_date.gte.${today}`)
        .is('deleted_at', null)
        .maybeSingle()

      if (error) {
        console.error('Failed to get default rate:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformRateCard(data) : null
    }),

  // ==========================================
  // GET BY CLIENT - All rate cards for a client
  // ==========================================
  getByClient: orgProtectedProcedure
    .input(z.object({
      clientId: z.string().uuid(),
      activeOnly: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('contact_rate_cards')
        .select(`
          *,
          contact:contacts!contact_id(id, first_name, last_name, company_name, subtype)
        `)
        .eq('org_id', orgId)
        .eq('client_id', input.clientId)
        .is('deleted_at', null)

      if (input.activeOnly) {
        const today = new Date().toISOString().split('T')[0]
        query = query
          .eq('is_active', true)
          .lte('effective_date', today)
          .or(`expiration_date.is.null,expiration_date.gte.${today}`)
      }

      query = query.order('bill_rate', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Failed to get rate cards by client:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(transformRateCard) ?? []
    }),

  // ==========================================
  // CREATE - Add new rate card
  // ==========================================
  create: orgProtectedProcedure
    .input(rateCardInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // If this is being set as default, unset existing default
      if (input.isDefault) {
        await adminClient
          .from('contact_rate_cards')
          .update({ is_default: false, updated_by: userId })
          .eq('org_id', orgId)
          .eq('contact_id', input.contactId)
          .eq('is_default', true)
      }

      // Calculate markup if both rates provided
      let markupPercent = input.markupPercent
      if (input.billRate && input.payRate && !markupPercent) {
        markupPercent = ((input.billRate - input.payRate) / input.payRate) * 100
      }

      const { data, error } = await adminClient
        .from('contact_rate_cards')
        .insert({
          org_id: orgId,
          contact_id: input.contactId,
          rate_name: input.rateName,
          rate_type: input.rateType,
          currency: input.currency,
          bill_rate: input.billRate,
          pay_rate: input.payRate,
          markup_percent: markupPercent,
          skill_category: input.skillCategory,
          job_level: input.jobLevel,
          client_id: input.clientId,
          effective_date: input.effectiveDate,
          expiration_date: input.expirationDate,
          is_default: input.isDefault,
          is_active: true,
          notes: input.notes,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create rate card:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Modify existing rate card
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      rateName: z.string().min(1).optional(),
      rateType: rateTypeEnum.optional(),
      currency: currencyEnum.optional(),
      billRate: z.number().min(0).optional(),
      payRate: z.number().min(0).optional(),
      markupPercent: z.number().min(0).max(100).optional(),
      skillCategory: z.string().optional(),
      jobLevel: z.string().optional(),
      clientId: z.string().uuid().optional(),
      effectiveDate: z.string().optional(),
      expirationDate: z.string().optional(),
      isDefault: z.boolean().optional(),
      isActive: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      const { id, ...updateData } = input

      // If setting as default, unset existing default first
      if (updateData.isDefault === true) {
        // Get the contact_id first
        const { data: existingRate } = await adminClient
          .from('contact_rate_cards')
          .select('contact_id')
          .eq('id', id)
          .eq('org_id', orgId)
          .single()

        if (existingRate) {
          await adminClient
            .from('contact_rate_cards')
            .update({ is_default: false, updated_by: userId })
            .eq('org_id', orgId)
            .eq('contact_id', existingRate.contact_id)
            .eq('is_default', true)
            .neq('id', id)
        }
      }

      // Build update object
      const dbUpdate: Record<string, unknown> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }

      if (updateData.rateName !== undefined) dbUpdate.rate_name = updateData.rateName
      if (updateData.rateType !== undefined) dbUpdate.rate_type = updateData.rateType
      if (updateData.currency !== undefined) dbUpdate.currency = updateData.currency
      if (updateData.billRate !== undefined) dbUpdate.bill_rate = updateData.billRate
      if (updateData.payRate !== undefined) dbUpdate.pay_rate = updateData.payRate
      if (updateData.markupPercent !== undefined) dbUpdate.markup_percent = updateData.markupPercent
      if (updateData.skillCategory !== undefined) dbUpdate.skill_category = updateData.skillCategory
      if (updateData.jobLevel !== undefined) dbUpdate.job_level = updateData.jobLevel
      if (updateData.clientId !== undefined) dbUpdate.client_id = updateData.clientId
      if (updateData.effectiveDate !== undefined) dbUpdate.effective_date = updateData.effectiveDate
      if (updateData.expirationDate !== undefined) dbUpdate.expiration_date = updateData.expirationDate
      if (updateData.isDefault !== undefined) dbUpdate.is_default = updateData.isDefault
      if (updateData.isActive !== undefined) dbUpdate.is_active = updateData.isActive
      if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes

      const { error } = await adminClient
        .from('contact_rate_cards')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update rate card:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Soft delete rate card
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_rate_cards')
        .update({
          deleted_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete rate card:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DEACTIVATE - Mark rate card as inactive
  // ==========================================
  deactivate: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      expirationDate: z.string().optional(), // Defaults to today
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('contact_rate_cards')
        .update({
          is_active: false,
          expiration_date: input.expirationDate || new Date().toISOString().split('T')[0],
          updated_by: user?.id,
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

  // ==========================================
  // SET DEFAULT - Make a rate card the default
  // ==========================================
  setDefault: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // Get the contact_id first
      const { data: rateCard } = await adminClient
        .from('contact_rate_cards')
        .select('contact_id')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!rateCard) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Rate card not found' })
      }

      // Unset existing default
      await adminClient
        .from('contact_rate_cards')
        .update({ is_default: false, updated_by: userId })
        .eq('org_id', orgId)
        .eq('contact_id', rateCard.contact_id)
        .eq('is_default', true)

      // Set new default
      const { error } = await adminClient
        .from('contact_rate_cards')
        .update({
          is_default: true,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to set default rate card:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // STATS - Rate card statistics
  // ==========================================
  stats: orgProtectedProcedure
    .input(z.object({
      contactId: z.string().uuid().optional(),
      clientId: z.string().uuid().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()
      const today = new Date().toISOString().split('T')[0]

      let query = adminClient
        .from('contact_rate_cards')
        .select('id, rate_type, currency, bill_rate, pay_rate, is_default, is_active, effective_date, expiration_date')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (input?.contactId) {
        query = query.eq('contact_id', input.contactId)
      }

      if (input?.clientId) {
        query = query.eq('client_id', input.clientId)
      }

      const { data: rateCards } = await query

      // Count active rates (currently effective)
      const activeRates = rateCards?.filter(rc =>
        rc.is_active &&
        rc.effective_date <= today &&
        (!rc.expiration_date || rc.expiration_date >= today)
      ) || []

      const byType = rateCards?.reduce((acc, rc) => {
        acc[rc.rate_type] = (acc[rc.rate_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const byCurrency = rateCards?.reduce((acc, rc) => {
        acc[rc.currency] = (acc[rc.currency] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Calculate average bill rate for active rates
      const billRates = activeRates.map(rc => rc.bill_rate).filter(Boolean)
      const avgBillRate = billRates.length
        ? (billRates.reduce((sum, r) => sum + r, 0) / billRates.length).toFixed(2)
        : '0'

      // Calculate average margin for rates with both bill and pay
      const ratesWithMargin = activeRates.filter(rc => rc.bill_rate && rc.pay_rate)
      const avgMargin = ratesWithMargin.length
        ? (ratesWithMargin.reduce((sum, rc) => sum + ((rc.bill_rate - rc.pay_rate!) / rc.bill_rate * 100), 0) / ratesWithMargin.length).toFixed(1)
        : '0'

      return {
        total: rateCards?.length ?? 0,
        active: activeRates.length,
        defaults: rateCards?.filter(rc => rc.is_default).length ?? 0,
        byType,
        byCurrency,
        avgBillRate,
        avgMarginPercent: avgMargin,
        rateRange: billRates.length ? {
          min: Math.min(...billRates),
          max: Math.max(...billRates),
        } : null,
      }
    }),
})
