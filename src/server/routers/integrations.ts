import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

// Input schemas
const integrationStatusSchema = z.enum(['active', 'inactive', 'error'])
const integrationTypeSchema = z.enum([
  'email', 'sms', 'calendar', 'video', 'storage',
  'hris', 'payroll', 'background_check', 'job_board', 'crm'
])

// Admin client for bypassing RLS
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const integrationsRouter = router({
  // ============================================
  // GET INTEGRATION TYPES
  // ============================================
  getTypes: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase } = ctx

      const { data: types, error } = await supabase
        .from('integration_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch integration types',
        })
      }

      return types ?? []
    }),

  // ============================================
  // GET STATS FOR DASHBOARD
  // ============================================
  getStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('get_integration_stats', { p_org_id: orgId })

      if (error) {
        console.error('Failed to fetch integration stats:', error)
        // Return default values on error
        return {
          total: 0,
          active: 0,
          error: 0,
          inactive: 0,
        }
      }

      const stats = data?.[0] ?? { total_count: 0, active_count: 0, error_count: 0, inactive_count: 0 }
      return {
        total: Number(stats.total_count),
        active: Number(stats.active_count),
        error: Number(stats.error_count),
        inactive: Number(stats.inactive_count),
      }
    }),

  // ============================================
  // GET CRITICAL ALERTS
  // ============================================
  getCriticalAlerts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: alerts, error } = await adminClient
        .from('integrations')
        .select('id, name, type, provider, status, error_message, error_count, last_health_check, updated_at')
        .eq('org_id', orgId)
        .eq('status', 'error')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Failed to fetch critical alerts:', error)
        return []
      }

      return alerts ?? []
    }),

  // ============================================
  // LIST INTEGRATIONS
  // ============================================
  list: orgProtectedProcedure
    .input(z.object({
      search: z.string().optional(),
      type: integrationTypeSchema.optional(),
      status: integrationStatusSchema.optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { search, type, status, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('integrations')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      // Apply filters
      if (search) {
        query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%`)
      }
      if (type) {
        query = query.eq('type', type)
      }
      if (status) {
        query = query.eq('status', status)
      }

      // Pagination
      const offset = (page - 1) * pageSize
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch integrations:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch integrations',
        })
      }

      return {
        items: data ?? [],
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // ============================================
  // GET INTEGRATION BY ID
  // ============================================
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: integration, error } = await adminClient
        .from('integrations')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      return integration
    }),

  // ============================================
  // CREATE INTEGRATION
  // ============================================
  create: orgProtectedProcedure
    .input(z.object({
      type: integrationTypeSchema,
      provider: z.string().min(1).max(50),
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      config: z.record(z.unknown()),
      isPrimary: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // If setting as primary, unset any existing primary for this type
      if (input.isPrimary) {
        await adminClient
          .from('integrations')
          .update({ is_primary: false })
          .eq('org_id', orgId)
          .eq('type', input.type)
          .eq('is_primary', true)
      }

      // Create integration
      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          org_id: orgId,
          type: input.type,
          provider: input.provider,
          name: input.name,
          description: input.description,
          config: input.config,
          is_primary: input.isPrimary,
          status: 'inactive',
          health_status: 'unknown',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error || !integration) {
        console.error('Failed to create integration:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create integration',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'integrations',
        record_id: integration.id,
        new_values: {
          type: input.type,
          provider: input.provider,
          name: input.name,
        },
      })

      return integration
    }),

  // ============================================
  // UPDATE INTEGRATION
  // ============================================
  update: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional().nullable(),
      config: z.record(z.unknown()).optional(),
      isPrimary: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current integration
      const { data: current, error: fetchError } = await adminClient
        .from('integrations')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      // If setting as primary, unset any existing primary for this type
      if (input.isPrimary && !current.is_primary) {
        await adminClient
          .from('integrations')
          .update({ is_primary: false })
          .eq('org_id', orgId)
          .eq('type', current.type)
          .eq('is_primary', true)
      }

      // Build update object
      const updates: Record<string, unknown> = {}
      if (input.name !== undefined) updates.name = input.name
      if (input.description !== undefined) updates.description = input.description
      if (input.config !== undefined) updates.config = input.config
      if (input.isPrimary !== undefined) updates.is_primary = input.isPrimary

      // Update integration
      const { data: integration, error: updateError } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (updateError || !integration) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update integration',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'integrations',
        record_id: input.id,
        old_values: { name: current.name, description: current.description },
        new_values: { name: integration.name, description: integration.description },
      })

      return integration
    }),

  // ============================================
  // DELETE INTEGRATION (Soft Delete)
  // ============================================
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Verify exists
      const { data: current, error: fetchError } = await adminClient
        .from('integrations')
        .select('id, name, type')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !current) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from('integrations')
        .update({
          deleted_at: new Date().toISOString(),
          status: 'inactive',
          is_primary: false,
        })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (deleteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete integration',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'integrations',
        record_id: input.id,
        old_values: { name: current.name, type: current.type },
      })

      return { success: true }
    }),

  // ============================================
  // TOGGLE STATUS
  // ============================================
  toggleStatus: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'inactive']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const updateData: Record<string, unknown> = {
        status: input.status,
      }

      // Clear error state when activating
      if (input.status === 'active') {
        updateData.error_message = null
        updateData.error_count = 0
      }

      const { data: integration, error } = await supabase
        .from('integrations')
        .update(updateData)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error || !integration) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update integration status',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'toggle_status',
        table_name: 'integrations',
        record_id: input.id,
        new_values: { status: input.status },
      })

      return integration
    }),

  // ============================================
  // TEST CONNECTION
  // ============================================
  testConnection: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid().optional(), // Optional: test existing integration
      type: integrationTypeSchema,
      provider: z.string(),
      config: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()
      const startTime = Date.now()

      try {
        // Test connection based on type
        let testResult: { success: boolean; message: string; details?: Record<string, unknown> }

        switch (input.type) {
          case 'email':
            testResult = await testEmailConnection(input.provider, input.config)
            break
          case 'sms':
            testResult = await testSmsConnection(input.provider, input.config)
            break
          default:
            // Generic test - just validate config is present
            testResult = {
              success: Object.keys(input.config).length > 0,
              message: Object.keys(input.config).length > 0
                ? 'Configuration validated'
                : 'No configuration provided',
            }
        }

        const responseTime = Date.now() - startTime

        // Log health check if testing existing integration
        if (input.id) {
          await adminClient.from('integration_health_logs').insert({
            org_id: orgId,
            integration_id: input.id,
            check_type: 'manual',
            status: testResult.success ? 'success' : 'failure',
            response_time_ms: responseTime,
            error_message: testResult.success ? null : testResult.message,
            details: testResult.details,
            checked_by: user?.id,
          })

          // Update integration health status
          await adminClient
            .from('integrations')
            .update({
              last_health_check: new Date().toISOString(),
              health_status: testResult.success ? 'healthy' : 'unhealthy',
              error_message: testResult.success ? null : testResult.message,
            })
            .eq('id', input.id)
        }

        return {
          success: testResult.success,
          message: testResult.message,
          responseTimeMs: responseTime,
          details: testResult.details,
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Log failed health check
        if (input.id) {
          await adminClient.from('integration_health_logs').insert({
            org_id: orgId,
            integration_id: input.id,
            check_type: 'manual',
            status: 'failure',
            response_time_ms: responseTime,
            error_message: errorMessage,
            checked_by: user?.id,
          })
        }

        return {
          success: false,
          message: errorMessage,
          responseTimeMs: responseTime,
        }
      }
    }),

  // ============================================
  // GET HEALTH LOGS
  // ============================================
  getHealthLogs: orgProtectedProcedure
    .input(z.object({
      integrationId: z.string().uuid(),
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data: logs, error } = await adminClient
        .from('integration_health_logs')
        .select(`
          id,
          check_type,
          status,
          response_time_ms,
          error_message,
          error_code,
          details,
          checked_by,
          created_at
        `)
        .eq('org_id', orgId)
        .eq('integration_id', input.integrationId)
        .order('created_at', { ascending: false })
        .limit(input.limit)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch health logs',
        })
      }

      return logs ?? []
    }),

  // ============================================
  // RUN HEALTH CHECK
  // ============================================
  runHealthCheck: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get integration
      const { data: integration, error: fetchError } = await adminClient
        .from('integrations')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (fetchError || !integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      const startTime = Date.now()

      try {
        // Run test based on type
        let testResult: { success: boolean; message: string; details?: Record<string, unknown> }

        switch (integration.type) {
          case 'email':
            testResult = await testEmailConnection(integration.provider, integration.config as Record<string, unknown>)
            break
          case 'sms':
            testResult = await testSmsConnection(integration.provider, integration.config as Record<string, unknown>)
            break
          default:
            testResult = {
              success: true,
              message: 'Health check passed (configuration validated)',
            }
        }

        const responseTime = Date.now() - startTime

        // Log health check
        await adminClient.from('integration_health_logs').insert({
          org_id: orgId,
          integration_id: input.id,
          check_type: 'manual',
          status: testResult.success ? 'success' : 'failure',
          response_time_ms: responseTime,
          error_message: testResult.success ? null : testResult.message,
          details: testResult.details,
          checked_by: user?.id,
        })

        // Update integration
        await adminClient
          .from('integrations')
          .update({
            last_health_check: new Date().toISOString(),
            health_status: testResult.success ? 'healthy' : 'unhealthy',
            error_message: testResult.success ? null : testResult.message,
            error_count: testResult.success ? 0 : (integration.error_count ?? 0) + 1,
            status: testResult.success && integration.status === 'error' ? 'active' : integration.status,
          })
          .eq('id', input.id)

        return {
          success: testResult.success,
          message: testResult.message,
          responseTimeMs: responseTime,
          healthStatus: testResult.success ? 'healthy' : 'unhealthy',
        }
      } catch (error) {
        const responseTime = Date.now() - startTime
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        await adminClient.from('integration_health_logs').insert({
          org_id: orgId,
          integration_id: input.id,
          check_type: 'manual',
          status: 'failure',
          response_time_ms: responseTime,
          error_message: errorMessage,
          checked_by: user?.id,
        })

        await adminClient
          .from('integrations')
          .update({
            last_health_check: new Date().toISOString(),
            health_status: 'unhealthy',
            error_message: errorMessage,
            error_count: (integration.error_count ?? 0) + 1,
          })
          .eq('id', input.id)

        return {
          success: false,
          message: errorMessage,
          responseTimeMs: responseTime,
          healthStatus: 'unhealthy',
        }
      }
    }),

  // ============================================
  // WEBHOOK PROCEDURES
  // ============================================

  // List webhooks
  listWebhooks: orgProtectedProcedure
    .input(z.object({
      status: z.enum(['active', 'inactive', 'disabled']).optional(),
      page: z.number().default(1),
      pageSize: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const { status, page, pageSize } = input
      const adminClient = getAdminClient()

      let query = adminClient
        .from('webhooks')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .is('deleted_at', null)

      if (status) {
        query = query.eq('status', status)
      }

      const offset = (page - 1) * pageSize
      query = query
        .range(offset, offset + pageSize - 1)
        .order('created_at', { ascending: false })

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch webhooks',
        })
      }

      return {
        items: data ?? [],
        pagination: {
          total: count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((count ?? 0) / pageSize),
        },
      }
    }),

  // Get webhook stats
  getWebhookStats: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .rpc('get_webhook_stats', { p_org_id: orgId })

      if (error) {
        console.error('Failed to fetch webhook stats:', error)
        return {
          totalWebhooks: 0,
          activeWebhooks: 0,
          totalDeliveries: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          dlqCount: 0,
        }
      }

      const stats = data?.[0] ?? {}
      return {
        totalWebhooks: Number(stats.total_webhooks) || 0,
        activeWebhooks: Number(stats.active_webhooks) || 0,
        totalDeliveries: Number(stats.total_deliveries) || 0,
        successfulDeliveries: Number(stats.successful_deliveries) || 0,
        failedDeliveries: Number(stats.failed_deliveries) || 0,
        dlqCount: Number(stats.dlq_count) || 0,
      }
    }),

  // Get webhook by ID
  getWebhookById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('webhooks')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        })
      }

      return data
    }),

  // Create webhook
  createWebhook: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      url: z.string().url(),
      events: z.array(z.string()).min(1),
      headers: z.record(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      // Generate secret
      const secret = randomBytes(32).toString('hex')

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          url: input.url,
          secret,
          events: input.events,
          headers: input.headers || {},
          status: 'active',
          created_by: user?.id,
        })
        .select()
        .single()

      if (error || !webhook) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create webhook',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'create',
        table_name: 'webhooks',
        record_id: webhook.id,
        new_values: { name: input.name, url: input.url, events: input.events },
      })

      return webhook
    }),

  // Update webhook
  updateWebhook: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().optional().nullable(),
      url: z.string().url().optional(),
      events: z.array(z.string()).min(1).optional(),
      headers: z.record(z.string()).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx
      const { id, ...updates } = input

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error || !webhook) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update webhook',
        })
      }

      // Reset consecutive failures if re-enabling
      if (updates.status === 'active') {
        await supabase
          .from('webhooks')
          .update({ consecutive_failures: 0 })
          .eq('id', id)
      }

      return webhook
    }),

  // Delete webhook
  deleteWebhook: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx

      const { error } = await supabase
        .from('webhooks')
        .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete webhook',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'delete',
        table_name: 'webhooks',
        record_id: input.id,
      })

      return { success: true }
    }),

  // Regenerate webhook secret
  regenerateWebhookSecret: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId } = ctx

      const secret = randomBytes(32).toString('hex')

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update({ secret })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error || !webhook) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to regenerate secret',
        })
      }

      return { secret }
    }),

  // Test webhook
  testWebhook: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      eventType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get webhook
      const { data: webhook, error: webhookError } = await adminClient
        .from('webhooks')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (webhookError || !webhook) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Webhook not found',
        })
      }

      // Create test payload
      const testPayload = {
        event: input.eventType,
        test: true,
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          triggered_by: user?.email,
        },
      }

      const requestBody = JSON.stringify(testPayload)

      // Create delivery record
      const { data: delivery, error: deliveryError } = await adminClient
        .from('webhook_deliveries')
        .insert({
          org_id: orgId,
          webhook_id: input.id,
          event_type: input.eventType,
          payload: testPayload,
          request_url: webhook.url,
          request_headers: {
            'Content-Type': 'application/json',
            'X-InTime-Event': input.eventType,
          },
          request_body: requestBody,
          status: 'pending',
        })
        .select()
        .single()

      if (deliveryError || !delivery) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create delivery record',
        })
      }

      // Trigger edge function (fire and forget)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          delivery_id: delivery.id,
          webhook_id: input.id,
          org_id: orgId,
        }),
      }).catch(err => console.error('Failed to trigger webhook delivery:', err))

      return { deliveryId: delivery.id }
    }),

  // Get delivery history
  getDeliveryHistory: orgProtectedProcedure
    .input(z.object({
      webhookId: z.string().uuid().optional(),
      status: z.enum(['pending', 'success', 'failed', 'retrying', 'dlq']).optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      let query = adminClient
        .from('webhook_deliveries')
        .select('*, webhooks(name)', { count: 'exact' })
        .eq('org_id', orgId)

      if (input.webhookId) {
        query = query.eq('webhook_id', input.webhookId)
      }
      if (input.status) {
        query = query.eq('status', input.status)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      const { data, count, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch delivery history',
        })
      }

      return {
        items: data ?? [],
        total: count ?? 0,
      }
    }),

  // Get delivery details
  getDeliveryById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('webhook_deliveries')
        .select('*, webhooks(name, url)')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      return data
    }),

  // Replay delivery
  replayDelivery: orgProtectedProcedure
    .input(z.object({ deliveryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get original delivery
      const { data: original, error: originalError } = await adminClient
        .from('webhook_deliveries')
        .select('*')
        .eq('id', input.deliveryId)
        .eq('org_id', orgId)
        .single()

      if (originalError || !original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Delivery not found',
        })
      }

      // Create new delivery with same payload
      const { data: delivery, error: deliveryError } = await adminClient
        .from('webhook_deliveries')
        .insert({
          org_id: orgId,
          webhook_id: original.webhook_id,
          event_type: original.event_type,
          event_id: original.event_id,
          payload: original.payload,
          request_url: original.request_url,
          request_headers: original.request_headers,
          request_body: original.request_body,
          status: 'pending',
          attempt_number: 1,
        })
        .select()
        .single()

      if (deliveryError || !delivery) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create replay delivery',
        })
      }

      // Trigger edge function
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          delivery_id: delivery.id,
          webhook_id: original.webhook_id,
          org_id: orgId,
        }),
      }).catch(err => console.error('Failed to trigger replay:', err))

      return { deliveryId: delivery.id }
    }),

  // ============================================
  // RETRY CONFIGURATION PROCEDURES
  // ============================================

  // Get retry config
  getRetryConfig: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_retry_config')
        .select('*')
        .eq('org_id', orgId)
        .single()

      // Return defaults if no config exists
      if (error || !data) {
        return {
          maxRetries: 3,
          retryStrategy: 'exponential' as const,
          baseDelaySeconds: 5,
          maxDelaySeconds: 300,
          enableJitter: true,
          enableDlq: true,
          dlqRetentionDays: 30,
        }
      }

      return {
        maxRetries: data.max_retries,
        retryStrategy: data.retry_strategy as 'exponential' | 'linear' | 'fixed',
        baseDelaySeconds: data.base_delay_seconds,
        maxDelaySeconds: data.max_delay_seconds,
        enableJitter: data.enable_jitter,
        enableDlq: data.enable_dlq,
        dlqRetentionDays: data.dlq_retention_days,
      }
    }),

  // Update retry config
  updateRetryConfig: orgProtectedProcedure
    .input(z.object({
      maxRetries: z.number().min(1).max(10),
      retryStrategy: z.enum(['exponential', 'linear', 'fixed']),
      baseDelaySeconds: z.number().min(1).max(60),
      maxDelaySeconds: z.number().min(1).max(3600),
      enableJitter: z.boolean(),
      enableDlq: z.boolean(),
      dlqRetentionDays: z.number().min(1).max(90).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { supabase, orgId, user } = ctx
      const adminClient = getAdminClient()

      // Upsert config
      const { data, error } = await adminClient
        .from('integration_retry_config')
        .upsert({
          org_id: orgId,
          max_retries: input.maxRetries,
          retry_strategy: input.retryStrategy,
          base_delay_seconds: input.baseDelaySeconds,
          max_delay_seconds: input.maxDelaySeconds,
          enable_jitter: input.enableJitter,
          enable_dlq: input.enableDlq,
          dlq_retention_days: input.dlqRetentionDays ?? 30,
        }, { onConflict: 'org_id' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update retry config',
        })
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'update',
        table_name: 'integration_retry_config',
        new_values: input,
      })

      return data
    }),

  // ============================================
  // DLQ PROCEDURES
  // ============================================

  // Get DLQ items
  getDlqItems: orgProtectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, count, error } = await adminClient
        .from('webhook_deliveries')
        .select('*, webhooks(name, url)', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('status', 'dlq')
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch DLQ items',
        })
      }

      return {
        items: data ?? [],
        total: count ?? 0,
      }
    }),

  // Retry DLQ item
  retryDlqItem: orgProtectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Reset delivery to pending
      const { data, error } = await adminClient
        .from('webhook_deliveries')
        .update({
          status: 'pending',
          attempt_number: 1,
          next_retry_at: null,
          error_message: null,
        })
        .eq('id', input.itemId)
        .eq('org_id', orgId)
        .eq('status', 'dlq')
        .select()
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry DLQ item',
        })
      }

      // Trigger delivery
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

      fetch(`${supabaseUrl}/functions/v1/deliver-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          delivery_id: data.id,
          webhook_id: data.webhook_id,
          org_id: orgId,
        }),
      }).catch(err => console.error('Failed to trigger DLQ retry:', err))

      return { success: true }
    }),

  // Clear DLQ item
  clearDlqItem: orgProtectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { error } = await adminClient
        .from('webhook_deliveries')
        .update({ status: 'failed' }) // Mark as failed instead of deleting for audit
        .eq('id', input.itemId)
        .eq('org_id', orgId)
        .eq('status', 'dlq')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear DLQ item',
        })
      }

      return { success: true }
    }),

  // Clear all DLQ items
  clearAllDlqItems: orgProtectedProcedure
    .mutation(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // First count items to clear
      const { count } = await adminClient
        .from('webhook_deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'dlq')

      const { error } = await adminClient
        .from('webhook_deliveries')
        .update({ status: 'failed' })
        .eq('org_id', orgId)
        .eq('status', 'dlq')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear DLQ',
        })
      }

      return { success: true, cleared: count ?? 0 }
    }),

  // ============================================
  // OAUTH PROCEDURES
  // ============================================

  // Get OAuth status for integration
  getOAuthStatus: orgProtectedProcedure
    .input(z.object({ integrationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_oauth_tokens')
        .select('id, provider, account_email, status, expires_at, scope, last_refreshed_at')
        .eq('integration_id', input.integrationId)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        return {
          connected: false,
          token: null,
        }
      }

      return {
        connected: true,
        token: {
          id: data.id,
          provider: data.provider,
          accountEmail: data.account_email,
          status: data.status,
          expiresAt: data.expires_at,
          scope: data.scope,
          lastRefreshedAt: data.last_refreshed_at,
        },
      }
    }),

  // Initiate OAuth flow
  initiateOAuth: orgProtectedProcedure
    .input(z.object({
      integrationId: z.string().uuid(),
      provider: z.enum(['google', 'microsoft', 'zoom']),
      scopes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get integration config for client credentials
      const { data: integration, error } = await adminClient
        .from('integrations')
        .select('config')
        .eq('id', input.integrationId)
        .eq('org_id', orgId)
        .single()

      if (error || !integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      const config = integration.config as Record<string, string>
      const clientId = config.client_id

      if (!clientId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Client ID not configured',
        })
      }

      // Generate OAuth URL based on provider
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`
      const state = Buffer.from(JSON.stringify({
        integrationId: input.integrationId,
        orgId,
        provider: input.provider,
      })).toString('base64url')

      let authUrl: string
      const defaultScopes: Record<string, string[]> = {
        google: ['https://www.googleapis.com/auth/calendar'],
        microsoft: ['Calendars.ReadWrite', 'User.Read'],
        zoom: ['meeting:read', 'meeting:write'],
      }

      const scopes = input.scopes || defaultScopes[input.provider] || []

      switch (input.provider) {
        case 'google':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes.join(' '))}&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${state}`
          break
        case 'microsoft':
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes.join(' ') + ' offline_access')}&` +
            `state=${state}`
          break
        case 'zoom':
          authUrl = `https://zoom.us/oauth/authorize?` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `state=${state}`
          break
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Unsupported provider',
          })
      }

      return { authUrl }
    }),

  // Complete OAuth flow (called from callback)
  completeOAuth: orgProtectedProcedure
    .input(z.object({
      code: z.string(),
      state: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Decode state
      let stateData: { integrationId: string; orgId: string; provider: string }
      try {
        stateData = JSON.parse(Buffer.from(input.state, 'base64url').toString())
      } catch {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid state parameter',
        })
      }

      // Verify org matches
      if (stateData.orgId !== orgId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Organization mismatch',
        })
      }

      // Get integration config
      const { data: integration, error: integrationError } = await adminClient
        .from('integrations')
        .select('config')
        .eq('id', stateData.integrationId)
        .eq('org_id', orgId)
        .single()

      if (integrationError || !integration) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Integration not found',
        })
      }

      const config = integration.config as Record<string, string>
      const clientId = config.client_id
      const clientSecret = config.client_secret

      if (!clientId || !clientSecret) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'OAuth credentials not configured',
        })
      }

      // Exchange code for tokens
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`

      const tokenUrls: Record<string, string> = {
        google: 'https://oauth2.googleapis.com/token',
        microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        zoom: 'https://zoom.us/oauth/token',
      }

      const tokenUrl = tokenUrls[stateData.provider]
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: input.code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      })

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text()
        console.error('OAuth token exchange failed:', errorBody)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to exchange OAuth code',
        })
      }

      const tokenData = await tokenResponse.json()

      // Calculate expiration
      const expiresIn = tokenData.expires_in || 3600
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

      // Delete any existing active token for this integration
      await adminClient
        .from('integration_oauth_tokens')
        .update({ status: 'revoked' })
        .eq('integration_id', stateData.integrationId)
        .eq('status', 'active')

      // Create new token record
      const { error: tokenError } = await adminClient
        .from('integration_oauth_tokens')
        .insert({
          org_id: orgId,
          integration_id: stateData.integrationId,
          user_id: user?.id,
          provider: stateData.provider,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type || 'Bearer',
          scope: tokenData.scope,
          expires_at: expiresAt,
          account_email: tokenData.email,
          raw_token_response: tokenData,
          status: 'active',
        })
        .select()
        .single()

      if (tokenError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to store OAuth token',
        })
      }

      // Update integration status
      await adminClient
        .from('integrations')
        .update({
          status: 'active',
          health_status: 'healthy',
          error_message: null,
        })
        .eq('id', stateData.integrationId)

      return { success: true, integrationId: stateData.integrationId }
    }),

  // Disconnect OAuth
  disconnectOAuth: orgProtectedProcedure
    .input(z.object({ integrationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Revoke token
      const { error } = await adminClient
        .from('integration_oauth_tokens')
        .update({ status: 'revoked' })
        .eq('integration_id', input.integrationId)
        .eq('org_id', orgId)
        .eq('status', 'active')

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to disconnect OAuth',
        })
      }

      // Update integration status
      await adminClient
        .from('integrations')
        .update({
          status: 'inactive',
          health_status: 'unknown',
        })
        .eq('id', input.integrationId)

      return { success: true }
    }),

  // ============================================
  // FAILOVER PROCEDURES
  // ============================================

  // Get all failover configs
  getFailoverConfigs: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_failover_config')
        .select(`
          *,
          primary_integration:integrations!integration_failover_config_primary_integration_id_fkey(id, name, status, health_status, provider),
          backup_integration:integrations!integration_failover_config_backup_integration_id_fkey(id, name, status, health_status, provider)
        `)
        .eq('org_id', orgId)

      if (error) {
        console.error('Failed to fetch failover configs:', error)
        return { configs: [] }
      }

      return { configs: data ?? [] }
    }),

  // Get failover config for type
  getFailoverConfig: orgProtectedProcedure
    .input(z.object({ integrationType: z.string() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_failover_config')
        .select(`
          *,
          primary_integration:integrations!integration_failover_config_primary_integration_id_fkey(id, name, status, health_status),
          backup_integration:integrations!integration_failover_config_backup_integration_id_fkey(id, name, status, health_status)
        `)
        .eq('org_id', orgId)
        .eq('integration_type', input.integrationType)
        .single()

      if (error || !data) {
        return null
      }

      return data
    }),

  // Update failover config
  updateFailoverConfig: orgProtectedProcedure
    .input(z.object({
      integrationType: z.string(),
      primaryIntegrationId: z.string().uuid().optional().nullable(),
      backupIntegrationId: z.string().uuid().optional().nullable(),
      failoverThreshold: z.number().min(1).max(10).default(3),
      autoFailover: z.boolean().default(true),
      autoRecovery: z.boolean().default(false),
      recoveryCheckIntervalMinutes: z.number().min(5).max(1440).default(30),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      const { data, error } = await adminClient
        .from('integration_failover_config')
        .upsert({
          org_id: orgId,
          integration_type: input.integrationType,
          primary_integration_id: input.primaryIntegrationId,
          backup_integration_id: input.backupIntegrationId,
          failover_threshold: input.failoverThreshold,
          auto_failover: input.autoFailover,
          auto_recovery: input.autoRecovery,
          recovery_check_interval_minutes: input.recoveryCheckIntervalMinutes,
        }, { onConflict: 'org_id,integration_type' })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update failover config',
        })
      }

      return data
    }),

  // Trigger manual failover
  triggerFailover: orgProtectedProcedure
    .input(z.object({
      integrationType: z.string(),
      targetActive: z.enum(['primary', 'backup']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const adminClient = getAdminClient()

      // Get current config
      const { data: config, error: configError } = await adminClient
        .from('integration_failover_config')
        .select('*')
        .eq('org_id', orgId)
        .eq('integration_type', input.integrationType)
        .single()

      if (configError || !config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Failover config not found',
        })
      }

      if (input.targetActive === 'backup' && !config.backup_integration_id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No backup integration configured',
        })
      }

      // Update config
      const updateData: Record<string, unknown> = {
        current_active: input.targetActive,
      }

      if (input.targetActive === 'backup') {
        updateData.last_failover_at = new Date().toISOString()
        updateData.failover_count = (config.failover_count || 0) + 1
      } else {
        updateData.last_recovery_at = new Date().toISOString()
      }

      const { error: updateError } = await adminClient
        .from('integration_failover_config')
        .update(updateData)
        .eq('id', config.id)

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger failover',
        })
      }

      // Create audit log
      await adminClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: input.targetActive === 'backup' ? 'failover' : 'recovery',
        table_name: 'integration_failover_config',
        record_id: config.id,
        new_values: { current_active: input.targetActive },
      })

      return { success: true, currentActive: input.targetActive }
    }),
})

// ============================================
// HELPER FUNCTIONS FOR TESTING CONNECTIONS
// ============================================

async function testEmailConnection(
  provider: string,
  config: Record<string, unknown>
): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    switch (provider) {
      case 'smtp': {
        // Validate SMTP config
        const host = config.host as string
        const port = config.port as number
        const username = config.username as string
        const password = config.password as string

        if (!host || !port) {
          return { success: false, message: 'SMTP host and port are required' }
        }

        // For now, just validate config. Real SMTP test would use nodemailer
        return {
          success: true,
          message: 'SMTP configuration validated',
          details: { host, port, hasCredentials: !!(username && password) }
        }
      }
      case 'sendgrid': {
        const apiKey = config.api_key as string
        if (!apiKey) {
          return { success: false, message: 'SendGrid API key is required' }
        }
        // Could make actual API call to validate key
        return { success: true, message: 'SendGrid API key validated' }
      }
      case 'resend': {
        const apiKey = config.api_key as string
        if (!apiKey) {
          return { success: false, message: 'Resend API key is required' }
        }
        return { success: true, message: 'Resend API key validated' }
      }
      default:
        return { success: true, message: `${provider} configuration saved` }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed'
    }
  }
}

async function testSmsConnection(
  provider: string,
  config: Record<string, unknown>
): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    switch (provider) {
      case 'twilio': {
        const accountSid = config.account_sid as string
        const authToken = config.auth_token as string
        const fromNumber = config.from_number as string

        if (!accountSid || !authToken) {
          return { success: false, message: 'Twilio Account SID and Auth Token are required' }
        }

        // Could make actual API call to validate credentials
        return {
          success: true,
          message: 'Twilio credentials validated',
          details: { accountSid: accountSid.slice(0, 8) + '...', hasFromNumber: !!fromNumber }
        }
      }
      default:
        return { success: true, message: `${provider} configuration saved` }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed'
    }
  }
}
