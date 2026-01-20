/**
 * Accounts Router
 *
 * Per-section save endpoints for account management.
 * Uses the unified architecture with section-specific services.
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { events } from '../events'
import * as sections from '../services/account/sections'
import {
  identitySchema,
  locationsSchema,
  billingSchema,
  contactsSchema,
  contractsSchema,
  accountComplianceSchema,
  accountTeamSchema,
} from '../services/account/validations'

/**
 * Helper to get user_profiles.id from auth_id
 * (user.id is auth.users.id, not user_profiles.id)
 */
async function getUserProfileId(authId: string | undefined): Promise<string | null> {
  if (!authId) return null

  const adminClient = getAdminClient()
  const { data: profile } = await adminClient
    .from('user_profiles')
    .select('id')
    .eq('auth_id', authId)
    .single()

  return profile?.id ?? null
}

export const accountsRouter = router({
  // ============================================
  // CREATE DRAFT
  // ============================================

  createDraft: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const userProfileId = await getUserProfileId(ctx.user?.id)

      if (!userProfileId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User profile not found',
        })
      }

      // Create a draft account
      const { data: draft, error } = await adminClient
        .from('companies')
        .insert({
          org_id: ctx.orgId,
          name: 'Untitled Account',
          status: 'draft',
          category: 'prospect',
          relationship_type: 'direct_client',
          created_by: userProfileId,
          updated_by: userProfileId,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create draft: ${error.message}`,
        })
      }

      // Emit event
      await events.emit('account.draft.created', {
        accountId: draft.id,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return draft
    }),

  // ============================================
  // PER-SECTION SAVE ENDPOINTS
  // ============================================

  saveIdentity: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: identitySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveIdentity(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.identity.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  saveLocations: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: locationsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveLocations(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.locations.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  saveBilling: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: billingSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveBilling(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.billing.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  saveContacts: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: contactsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveContacts(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.contacts.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  saveContracts: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: contractsSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveContracts(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.contracts.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  saveCompliance: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: accountComplianceSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveCompliance(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.compliance.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  saveTeam: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      data: accountTeamSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const userProfileId = await getUserProfileId(ctx.user?.id)
      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User profile not found' })
      }

      const result = await sections.saveTeam(
        input.accountId,
        input.data,
        { orgId: ctx.orgId, userId: userProfileId }
      )

      await events.emit('account.team.updated', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
      })

      return result
    }),

  // ============================================
  // SUBMIT (FINALIZE DRAFT)
  // ============================================

  submit: orgProtectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      targetStatus: z.enum(['prospect', 'active']).default('active'),
    }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const userProfileId = await getUserProfileId(ctx.user?.id)

      if (!userProfileId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User profile not found',
        })
      }

      // Verify draft exists and belongs to user's org
      const { data: account, error: fetchError } = await adminClient
        .from('companies')
        .select('id, status')
        .eq('id', input.accountId)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found',
        })
      }

      if (account.status !== 'draft') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Account is not a draft',
        })
      }

      // Map target status to category
      const category = input.targetStatus === 'prospect' ? 'prospect' : 'client'

      // Update status
      const { data: updated, error: updateError } = await adminClient
        .from('companies')
        .update({
          status: input.targetStatus,
          category,
          custom_fields: {}, // Clear wizard state
          updated_by: userProfileId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.accountId)
        .select()
        .single()

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to submit account: ${updateError.message}`,
        })
      }

      // Emit event (triggers activity creation via handler)
      await events.emit('account.submitted', {
        accountId: input.accountId,
        orgId: ctx.orgId,
        userId: userProfileId,
        payload: { status: input.targetStatus },
      })

      return updated
    }),
})
