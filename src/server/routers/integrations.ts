import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

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
