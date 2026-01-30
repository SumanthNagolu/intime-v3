/**
 * Integration Providers Router
 * Manages integration provider operations (sync, e-signature, identity)
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { getAdminClient } from '@/lib/supabase/admin'
import { providerRegistry } from '@/lib/integrations/provider-registry'
import type { IntegrationConfig, IntegrationCategory, IntegrationStatus } from '@/lib/integrations/types'

// Helper to build integration config from database record
function buildIntegrationConfig(integration: {
  id: string
  org_id: string
  provider: string
  category: string
  status: string
  credentials: Record<string, unknown>
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}): IntegrationConfig {
  return {
    id: integration.id,
    orgId: integration.org_id,
    provider: integration.provider,
    category: integration.category as IntegrationCategory,
    status: integration.status as IntegrationStatus,
    credentials: integration.credentials as IntegrationConfig['credentials'],
    settings: integration.settings,
    createdAt: new Date(integration.created_at),
    updatedAt: new Date(integration.updated_at),
  }
}

export const integrationProvidersRouter = router({
  // ============ PROVIDER REGISTRY ============

  // List available providers
  listAvailableProviders: orgProtectedProcedure
    .input(z.object({
      category: z.enum(['payroll', 'esignature', 'identity', 'hris', 'calendar', 'communication']).optional(),
    }).optional())
    .query(({ input }) => {
      const providers = input?.category
        ? providerRegistry.listProvidersByCategory(input.category)
        : providerRegistry.listProviders()

      return providers.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        logoUrl: p.logoUrl,
        docsUrl: p.docsUrl,
      }))
    }),

  // ============ CONNECTION TESTING ============

  // Test integration connection
  testConnection: orgProtectedProcedure
    .input(z.object({ integrationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: integration, error } = await adminClient
        .from('integrations')
        .select('*')
        .eq('id', input.integrationId)
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .single()

      if (error || !integration) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Integration not found' })
      }

      // Check if provider is registered
      if (!providerRegistry.hasProvider(integration.provider)) {
        return {
          success: false,
          error: `Provider ${integration.provider} is not configured in the system`,
        }
      }

      try {
        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createProvider(config)
        const result = await provider.testConnection()

        // Update status based on result
        await adminClient
          .from('integrations')
          .update({
            status: result.success ? 'active' : 'error',
            last_health_check: new Date().toISOString(),
            error_message: result.error || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.integrationId)

        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'

        await adminClient
          .from('integrations')
          .update({
            status: 'error',
            last_health_check: new Date().toISOString(),
            error_message: message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.integrationId)

        return { success: false, error: message }
      }
    }),

  // ============ PAYROLL OPERATIONS ============

  payroll: router({
    // Sync employees from payroll provider
    syncEmployees: orgProtectedProcedure
      .input(z.object({ integrationId: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .eq('type', 'payroll')
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active payroll integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        try {
          const config = buildIntegrationConfig(integration)
          const provider = providerRegistry.createPayrollProvider(config)
          const result = await provider.syncEmployees()

          // Update sync status
          await adminClient
            .from('integrations')
            .update({
              last_sync_at: new Date().toISOString(),
              last_sync_result: result.success ? 'success' : (result.errorCount > 0 ? 'partial' : 'error'),
              sync_error_count: result.errorCount,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.integrationId)

          return result
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error'

          await adminClient
            .from('integrations')
            .update({
              last_sync_at: new Date().toISOString(),
              last_sync_result: 'error',
              error_message: message,
              updated_at: new Date().toISOString(),
            })
            .eq('id', input.integrationId)

          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message })
        }
      }),

    // Get employees from payroll provider
    getEmployees: orgProtectedProcedure
      .input(z.object({ integrationId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .eq('type', 'payroll')
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active payroll integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createPayrollProvider(config)
        return provider.getEmployees()
      }),
  }),

  // ============ E-SIGNATURE OPERATIONS ============

  esignature: router({
    // Get templates
    getTemplates: orgProtectedProcedure
      .input(z.object({ integrationId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['esignature', 'docusign'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active e-signature integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createESignatureProvider(config)
        return provider.getTemplates()
      }),

    // Send document for signature
    sendDocument: orgProtectedProcedure
      .input(z.object({
        integrationId: z.string().uuid(),
        templateId: z.string(),
        name: z.string(),
        recipients: z.array(z.object({
          email: z.string().email(),
          name: z.string(),
          role: z.string().optional(),
        })),
        fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['esignature', 'docusign'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active e-signature integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createESignatureProvider(config)
        return provider.sendDocument({
          templateId: input.templateId,
          name: input.name,
          recipients: input.recipients,
          fields: input.fields,
        })
      }),

    // Get document status
    getDocumentStatus: orgProtectedProcedure
      .input(z.object({
        integrationId: z.string().uuid(),
        envelopeId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['esignature', 'docusign'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active e-signature integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createESignatureProvider(config)
        return provider.getDocumentStatus(input.envelopeId)
      }),

    // Void document
    voidDocument: orgProtectedProcedure
      .input(z.object({
        integrationId: z.string().uuid(),
        envelopeId: z.string(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['esignature', 'docusign'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active e-signature integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createESignatureProvider(config)
        await provider.voidDocument(input.envelopeId, input.reason)
        return { success: true }
      }),
  }),

  // ============ IDENTITY OPERATIONS ============

  identity: router({
    // List users
    listUsers: orgProtectedProcedure
      .input(z.object({ integrationId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['identity', 'okta', 'sso'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active identity integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createIdentityProvider(config)
        return provider.listUsers()
      }),

    // Provision user
    provisionUser: orgProtectedProcedure
      .input(z.object({
        integrationId: z.string().uuid(),
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        activate: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['identity', 'okta', 'sso'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active identity integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createIdentityProvider(config)
        return provider.createUser({
          userName: input.email,
          active: input.activate,
          name: {
            givenName: input.firstName,
            familyName: input.lastName,
          },
          emails: [
            {
              value: input.email,
              type: 'work',
              primary: true,
            },
          ],
        })
      }),

    // Deprovision user
    deprovisionUser: orgProtectedProcedure
      .input(z.object({
        integrationId: z.string().uuid(),
        userId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const adminClient = getAdminClient()

        const { data: integration, error } = await adminClient
          .from('integrations')
          .select('*')
          .eq('id', input.integrationId)
          .eq('org_id', ctx.orgId)
          .in('type', ['identity', 'okta', 'sso'])
          .eq('status', 'active')
          .is('deleted_at', null)
          .single()

        if (error || !integration) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Active identity integration not found' })
        }

        if (!providerRegistry.hasProvider(integration.provider)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: `Provider ${integration.provider} not supported` })
        }

        const config = buildIntegrationConfig(integration)
        const provider = providerRegistry.createIdentityProvider(config)
        await provider.deactivateUser(input.userId)
        return { success: true }
      }),
  }),
})
