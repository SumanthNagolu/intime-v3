import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// ============================================
// INPUT SCHEMAS
// ============================================

const entityTypeEnum = z.enum([
  'candidate', 'account', 'contact', 'vendor',
  'organization', 'lead', 'job', 'interview',
  'employee', 'placement'
])

const addressTypeEnum = z.enum([
  'current', 'permanent', 'mailing', 'work',
  'billing', 'shipping', 'headquarters', 'office',
  'job_location', 'meeting', 'first_day'
])

const addressInput = z.object({
  entityType: entityTypeEnum,
  entityId: z.string().uuid(),
  addressType: addressTypeEnum,
  addressLine1: z.string().max(255).optional(),
  addressLine2: z.string().max(255).optional(),
  addressLine3: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  stateProvince: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  countryCode: z.string().length(2).default('US'),
  county: z.string().max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isPrimary: z.boolean().default(false),
  effectiveFrom: z.string().optional(), // ISO date
  effectiveTo: z.string().optional(),
  notes: z.string().optional(),
})

// Admin client for bypassing RLS
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

// Transform database row to camelCase response
function transformAddress(addr: Record<string, unknown>) {
  return {
    id: addr.id as string,
    entityType: addr.entity_type as string,
    entityId: addr.entity_id as string,
    addressType: addr.address_type as string,
    addressLine1: addr.address_line_1 as string | null,
    addressLine2: addr.address_line_2 as string | null,
    addressLine3: addr.address_line_3 as string | null,
    city: addr.city as string | null,
    stateProvince: addr.state_province as string | null,
    postalCode: addr.postal_code as string | null,
    countryCode: addr.country_code as string,
    county: addr.county as string | null,
    latitude: addr.latitude as number | null,
    longitude: addr.longitude as number | null,
    isVerified: addr.is_verified as boolean,
    verifiedAt: addr.verified_at as string | null,
    verificationSource: addr.verification_source as string | null,
    isPrimary: addr.is_primary as boolean,
    effectiveFrom: addr.effective_from as string | null,
    effectiveTo: addr.effective_to as string | null,
    notes: addr.notes as string | null,
    createdAt: addr.created_at as string,
    updatedAt: addr.updated_at as string,
    createdBy: addr.created_by as string | null,
    updatedBy: addr.updated_by as string | null,
  }
}

// ============================================
// ROUTER
// ============================================

export const addressesRouter = router({
  // ==========================================
  // LIST - Paginated list with filters
  // ==========================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      entityType: entityTypeEnum.optional(),
      addressType: addressTypeEnum.optional(),
      city: z.string().optional(),
      stateProvince: z.string().optional(),
      countryCode: z.string().optional(),
      isPrimary: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      sortBy: z.enum([
        'city', 'state_province', 'country_code', 'entity_type',
        'address_type', 'created_at', 'updated_at'
      ]).default('created_at'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('addresses')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)

      // Apply filters
      if (input.search) {
        query = query.or(
          `city.ilike.%${input.search}%,` +
          `state_province.ilike.%${input.search}%,` +
          `address_line_1.ilike.%${input.search}%,` +
          `postal_code.ilike.%${input.search}%`
        )
      }
      if (input.entityType) {
        query = query.eq('entity_type', input.entityType)
      }
      if (input.addressType) {
        query = query.eq('address_type', input.addressType)
      }
      if (input.city) {
        query = query.ilike('city', `%${input.city}%`)
      }
      if (input.stateProvince) {
        query = query.eq('state_province', input.stateProvince)
      }
      if (input.countryCode) {
        query = query.eq('country_code', input.countryCode)
      }
      if (input.isPrimary !== undefined) {
        query = query.eq('is_primary', input.isPrimary)
      }

      // Apply sorting and pagination
      query = query
        .order(input.sortBy, { ascending: input.sortOrder === 'asc' })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to list addresses:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return {
        items: data?.map(transformAddress) ?? [],
        total: count ?? 0,
      }
    }),

  // ==========================================
  // STATS - Dashboard metrics
  // ==========================================
  stats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: addresses } = await adminClient
        .from('addresses')
        .select('id, entity_type, is_primary, is_verified')
        .eq('org_id', orgId)

      const byEntityType = addresses?.reduce((acc, addr) => {
        acc[addr.entity_type] = (acc[addr.entity_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        total: addresses?.length ?? 0,
        accounts: byEntityType['account'] ?? 0,
        contacts: byEntityType['contact'] ?? 0,
        jobs: byEntityType['job'] ?? 0,
        employees: byEntityType['employee'] ?? 0,
        verified: addresses?.filter(a => a.is_verified).length ?? 0,
        primary: addresses?.filter(a => a.is_primary).length ?? 0,
      }
    }),

  // ==========================================
  // GET BY ID - Single address details
  // ==========================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('addresses')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' })
      }

      return transformAddress(data)
    }),

  // ==========================================
  // GET BY ENTITY - Addresses for a specific entity
  // ==========================================
  getByEntity: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('addresses')
        .select('*')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to get addresses by entity:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data?.map(addr => ({
        id: addr.id,
        addressType: addr.address_type,
        addressLine1: addr.address_line_1,
        addressLine2: addr.address_line_2,
        city: addr.city,
        stateProvince: addr.state_province,
        postalCode: addr.postal_code,
        countryCode: addr.country_code,
        isPrimary: addr.is_primary,
        isVerified: addr.is_verified,
        notes: addr.notes,
      })) ?? []
    }),

  // ==========================================
  // GET PRIMARY - Get primary address for entity
  // ==========================================
  getPrimary: orgProtectedProcedure
    .input(z.object({
      entityType: entityTypeEnum,
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('addresses')
        .select('*')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .eq('is_primary', true)
        .maybeSingle()

      if (error) {
        console.error('Failed to get primary address:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return data ? transformAddress(data) : null
    }),

  // ==========================================
  // CREATE - Add new address
  // ==========================================
  create: orgProtectedProcedure
    .input(addressInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // If setting as primary, unset other primary addresses for this entity
      if (input.isPrimary) {
        await adminClient
          .from('addresses')
          .update({ is_primary: false, updated_by: userId })
          .eq('org_id', orgId)
          .eq('entity_type', input.entityType)
          .eq('entity_id', input.entityId)
          .eq('is_primary', true)
      }

      const { data, error } = await adminClient
        .from('addresses')
        .insert({
          org_id: orgId,
          entity_type: input.entityType,
          entity_id: input.entityId,
          address_type: input.addressType,
          address_line_1: input.addressLine1,
          address_line_2: input.addressLine2,
          address_line_3: input.addressLine3,
          city: input.city,
          state_province: input.stateProvince,
          postal_code: input.postalCode,
          country_code: input.countryCode,
          county: input.county,
          latitude: input.latitude,
          longitude: input.longitude,
          is_primary: input.isPrimary,
          effective_from: input.effectiveFrom,
          effective_to: input.effectiveTo,
          notes: input.notes,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create address:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { id: data.id }
    }),

  // ==========================================
  // UPDATE - Modify existing address
  // ==========================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      addressType: addressTypeEnum.optional(),
      addressLine1: z.string().max(255).optional(),
      addressLine2: z.string().max(255).optional(),
      addressLine3: z.string().max(255).optional(),
      city: z.string().max(100).optional(),
      stateProvince: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      countryCode: z.string().length(2).optional(),
      county: z.string().max(100).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      isPrimary: z.boolean().optional(),
      effectiveFrom: z.string().optional(),
      effectiveTo: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      const { id, ...updateData } = input

      // If setting as primary, unset other primary addresses
      if (updateData.isPrimary) {
        // First get the address to know its entity
        const { data: existing } = await adminClient
          .from('addresses')
          .select('entity_type, entity_id')
          .eq('id', id)
          .single()

        if (existing) {
          await adminClient
            .from('addresses')
            .update({ is_primary: false, updated_by: userId })
            .eq('org_id', orgId)
            .eq('entity_type', existing.entity_type)
            .eq('entity_id', existing.entity_id)
            .eq('is_primary', true)
            .neq('id', id)
        }
      }

      // Build update object with only provided fields
      const dbUpdate: Record<string, unknown> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }

      if (updateData.addressType !== undefined) dbUpdate.address_type = updateData.addressType
      if (updateData.addressLine1 !== undefined) dbUpdate.address_line_1 = updateData.addressLine1
      if (updateData.addressLine2 !== undefined) dbUpdate.address_line_2 = updateData.addressLine2
      if (updateData.addressLine3 !== undefined) dbUpdate.address_line_3 = updateData.addressLine3
      if (updateData.city !== undefined) dbUpdate.city = updateData.city
      if (updateData.stateProvince !== undefined) dbUpdate.state_province = updateData.stateProvince
      if (updateData.postalCode !== undefined) dbUpdate.postal_code = updateData.postalCode
      if (updateData.countryCode !== undefined) dbUpdate.country_code = updateData.countryCode
      if (updateData.county !== undefined) dbUpdate.county = updateData.county
      if (updateData.latitude !== undefined) dbUpdate.latitude = updateData.latitude
      if (updateData.longitude !== undefined) dbUpdate.longitude = updateData.longitude
      if (updateData.isPrimary !== undefined) dbUpdate.is_primary = updateData.isPrimary
      if (updateData.effectiveFrom !== undefined) dbUpdate.effective_from = updateData.effectiveFrom
      if (updateData.effectiveTo !== undefined) dbUpdate.effective_to = updateData.effectiveTo
      if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes

      const { error } = await adminClient
        .from('addresses')
        .update(dbUpdate)
        .eq('id', id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to update address:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // DELETE - Remove address
  // ==========================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('addresses')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to delete address:', error)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      }

      return { success: true }
    }),

  // ==========================================
  // SET PRIMARY - Set an address as primary
  // ==========================================
  setPrimary: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // Get the address to know its entity
      const { data: address } = await adminClient
        .from('addresses')
        .select('entity_type, entity_id')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (!address) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Address not found' })
      }

      // Unset all other primary addresses for this entity
      await adminClient
        .from('addresses')
        .update({ is_primary: false, updated_by: userId })
        .eq('org_id', orgId)
        .eq('entity_type', address.entity_type)
        .eq('entity_id', address.entity_id)

      // Set this one as primary
      await adminClient
        .from('addresses')
        .update({ is_primary: true, updated_by: userId })
        .eq('id', input.id)

      return { success: true }
    }),

  // ==========================================
  // UPSERT FOR ENTITY - Create or update address for entity
  // ==========================================
  upsertForEntity: orgProtectedProcedure
    .input(addressInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const userId = user?.id

      // Check if address of this type already exists for entity
      const { data: existing } = await adminClient
        .from('addresses')
        .select('id')
        .eq('org_id', orgId)
        .eq('entity_type', input.entityType)
        .eq('entity_id', input.entityId)
        .eq('address_type', input.addressType)
        .maybeSingle()

      if (existing) {
        // Update existing
        const { error } = await adminClient
          .from('addresses')
          .update({
            address_line_1: input.addressLine1,
            address_line_2: input.addressLine2,
            address_line_3: input.addressLine3,
            city: input.city,
            state_province: input.stateProvince,
            postal_code: input.postalCode,
            country_code: input.countryCode,
            county: input.county,
            latitude: input.latitude,
            longitude: input.longitude,
            is_primary: input.isPrimary,
            effective_from: input.effectiveFrom,
            effective_to: input.effectiveTo,
            notes: input.notes,
            updated_by: userId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (error) {
          console.error('Failed to update address:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: existing.id, created: false }
      } else {
        // Create new
        if (input.isPrimary) {
          await adminClient
            .from('addresses')
            .update({ is_primary: false, updated_by: userId })
            .eq('org_id', orgId)
            .eq('entity_type', input.entityType)
            .eq('entity_id', input.entityId)
            .eq('is_primary', true)
        }

        const { data, error } = await adminClient
          .from('addresses')
          .insert({
            org_id: orgId,
            entity_type: input.entityType,
            entity_id: input.entityId,
            address_type: input.addressType,
            address_line_1: input.addressLine1,
            address_line_2: input.addressLine2,
            address_line_3: input.addressLine3,
            city: input.city,
            state_province: input.stateProvince,
            postal_code: input.postalCode,
            country_code: input.countryCode,
            county: input.county,
            latitude: input.latitude,
            longitude: input.longitude,
            is_primary: input.isPrimary,
            effective_from: input.effectiveFrom,
            effective_to: input.effectiveTo,
            notes: input.notes,
            created_by: userId,
            updated_by: userId,
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create address:', error)
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        }

        return { id: data.id, created: true }
      }
    }),
})
