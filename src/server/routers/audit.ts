import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// Create service role client for admin operations
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

// Input schemas
const listAuditLogsInput = z.object({
  search: z.string().optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  objectType: z.string().optional(), // table_name
  result: z.enum(['SUCCESS', 'FAILURE']).optional(),
  severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  ipAddress: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
})

const getAuditLogInput = z.object({
  id: z.string().uuid(),
})

const exportAuditLogsInput = z.object({
  dateFrom: z.string(),
  dateTo: z.string(),
  format: z.enum(['csv', 'json']).default('csv'),
  filters: z.object({
    userId: z.string().uuid().optional(),
    action: z.string().optional(),
    objectType: z.string().optional(),
    result: z.enum(['SUCCESS', 'FAILURE']).optional(),
    severity: z.enum(['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  }).optional(),
  includeUserDetails: z.boolean().default(true),
  includeChangeDetails: z.boolean().default(true),
})

const listSecurityAlertsInput = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'dismissed', 'all']).default('all'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  limit: z.number().min(1).max(100).default(20),
})

const updateSecurityAlertInput = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'investigating', 'resolved', 'dismissed']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  resolutionNotes: z.string().optional(),
  actionsTaken: z.array(z.string()).optional(),
})

const alertRuleInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  eventType: z.string(),
  resultCondition: z.enum(['ANY', 'SUCCESS', 'FAILURE']).default('ANY'),
  thresholdCount: z.number().min(1).max(100).default(5),
  timeWindowMinutes: z.number().min(1).max(1440).default(10), // Max 24 hours
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  notificationChannels: z.object({
    dashboard: z.boolean().default(true),
    email: z.array(z.string().email()).optional(),
  }).default({ dashboard: true }),
  autoAction: z.enum(['none', 'lock_account', 'block_ip', 'require_2fa', 'notify_manager']).default('none'),
  isActive: z.boolean().default(true),
})

export const auditRouter = router({
  // Get audit stats for dashboard
  getStats: orgProtectedProcedure
    .input(z.object({ hours: z.number().default(24) }).optional())
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()
      const hours = input?.hours ?? 24

      const { data, error } = await serviceClient
        .rpc('get_audit_stats', { p_org_id: orgId, p_hours: hours })

      if (error) {
        console.error('Failed to get audit stats:', error)
        return {
          totalEvents: 0,
          failedLogins: 0,
          securityAlerts: 0,
          dataExports: 0,
          failedLoginRate: 0,
          permissionChanges: 0,
        }
      }

      const stats = data?.[0]
      return {
        totalEvents: Number(stats?.total_events ?? 0),
        failedLogins: Number(stats?.failed_logins ?? 0),
        securityAlerts: Number(stats?.security_alerts ?? 0),
        dataExports: Number(stats?.data_exports ?? 0),
        failedLoginRate: Number(stats?.failed_login_rate ?? 0),
        permissionChanges: Number(stats?.permission_changes ?? 0),
      }
    }),

  // List audit logs with filtering and pagination
  list: orgProtectedProcedure
    .input(listAuditLogsInput)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()
      const { search, dateFrom, dateTo, userId, action, objectType, result, severity, ipAddress, page, pageSize } = input

      let query = serviceClient
        .from('audit_logs')
        .select(`
          id,
          event_id,
          action,
          table_name,
          record_id,
          user_id,
          user_email,
          old_values,
          new_values,
          created_at,
          severity,
          result,
          ip_address,
          user_agent,
          object_name,
          metadata
        `, { count: 'exact' })
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (search) {
        query = query.or(`user_email.ilike.%${search}%,record_id.ilike.%${search}%,object_name.ilike.%${search}%`)
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }
      if (userId) {
        query = query.eq('user_id', userId)
      }
      if (action) {
        query = query.eq('action', action)
      }
      if (objectType) {
        query = query.eq('table_name', objectType)
      }
      if (result) {
        query = query.eq('result', result)
      }
      if (severity) {
        query = query.eq('severity', severity)
      }
      if (ipAddress) {
        query = query.eq('ip_address', ipAddress)
      }

      // Pagination
      const offset = (page - 1) * pageSize
      query = query.range(offset, offset + pageSize - 1)

      const { data, count, error } = await query

      if (error) {
        console.error('Failed to fetch audit logs:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs',
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

  // Get single audit log detail
  getById: orgProtectedProcedure
    .input(getAuditLogInput)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audit log entry not found',
        })
      }

      // Get related events (same user, within 5 minutes)
      const { data: relatedEvents } = await serviceClient
        .from('audit_logs')
        .select('id, event_id, action, table_name, created_at, result')
        .eq('org_id', orgId)
        .eq('user_id', data.user_id)
        .gte('created_at', new Date(new Date(data.created_at).getTime() - 5 * 60 * 1000).toISOString())
        .lte('created_at', new Date(new Date(data.created_at).getTime() + 5 * 60 * 1000).toISOString())
        .neq('id', data.id)
        .order('created_at', { ascending: true })
        .limit(10)

      // Get user details if user_id exists
      let userDetails = null
      if (data.user_id) {
        const { data: user } = await serviceClient
          .from('user_profiles')
          .select('full_name, email, role:roles(display_name)')
          .eq('id', data.user_id)
          .single()
        userDetails = user
      }

      return {
        ...data,
        userDetails,
        relatedEvents: relatedEvents ?? [],
      }
    }),

  // Export audit logs
  export: orgProtectedProcedure
    .input(exportAuditLogsInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const serviceClient = getServiceClient()
      const { dateFrom, dateTo, format, filters, includeUserDetails, includeChangeDetails } = input

      // Build query
      let query = serviceClient
        .from('audit_logs')
        .select('*')
        .eq('org_id', orgId)
        .gte('created_at', dateFrom)
        .lte('created_at', dateTo)
        .order('created_at', { ascending: false })
        .limit(100000) // Max 100k records

      // Apply filters
      if (filters?.userId) query = query.eq('user_id', filters.userId)
      if (filters?.action) query = query.eq('action', filters.action)
      if (filters?.objectType) query = query.eq('table_name', filters.objectType)
      if (filters?.result) query = query.eq('result', filters.result)
      if (filters?.severity) query = query.eq('severity', filters.severity)

      const { data: logs, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audit logs for export',
        })
      }

      // Format data based on export format
      let exportData: string
      let contentType: string
      let filename: string

      const timestamp = new Date().toISOString().split('T')[0]

      if (format === 'json') {
        const jsonData = logs?.map(log => ({
          event_id: log.event_id,
          timestamp: log.created_at,
          event_type: log.action,
          severity: log.severity,
          result: log.result,
          ...(includeUserDetails && {
            user: {
              id: log.user_id,
              email: log.user_email,
            },
            context: {
              ip_address: log.ip_address,
              user_agent: log.user_agent,
              session_id: log.session_id,
            },
          }),
          object: {
            type: log.table_name,
            id: log.record_id,
            name: log.object_name,
          },
          ...(includeChangeDetails && {
            changes: {
              old_values: log.old_values,
              new_values: log.new_values,
            },
          }),
        }))
        exportData = JSON.stringify({ events: jsonData, exportedAt: new Date().toISOString(), count: jsonData?.length }, null, 2)
        contentType = 'application/json'
        filename = `audit-logs-${timestamp}.json`
      } else {
        // CSV format
        const headers = [
          'timestamp',
          'event_id',
          'user_email',
          'action',
          'object_type',
          'object_id',
          'result',
          'severity',
          'ip_address',
          'user_agent',
        ]
        const rows = logs?.map(log => [
          log.created_at,
          log.event_id,
          log.user_email || '',
          log.action,
          log.table_name,
          log.record_id || '',
          log.result,
          log.severity,
          log.ip_address || '',
          log.user_agent || '',
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))

        exportData = [headers.join(','), ...(rows ?? [])].join('\n')
        contentType = 'text/csv'
        filename = `audit-logs-${timestamp}.csv`
      }

      // Log the export action
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'EXPORT',
        table_name: 'audit_logs',
        result: 'SUCCESS',
        severity: 'INFO',
        metadata: {
          format,
          dateFrom,
          dateTo,
          recordCount: logs?.length ?? 0,
        },
      })

      return {
        data: exportData,
        contentType,
        filename,
        recordCount: logs?.length ?? 0,
      }
    }),

  // ================== Security Alerts ==================

  // List security alerts
  listAlerts: orgProtectedProcedure
    .input(listSecurityAlertsInput)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()
      const { status, severity, limit } = input

      let query = serviceClient
        .from('security_alerts')
        .select(`
          *,
          assigned_user:user_profiles!security_alerts_assigned_to_fkey(full_name, email),
          related_user:user_profiles!security_alerts_related_user_id_fkey(full_name, email)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status !== 'all') {
        query = query.eq('status', status)
      }
      if (severity) {
        query = query.eq('severity', severity)
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch security alerts:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch security alerts',
        })
      }

      return data ?? []
    }),

  // Get single security alert
  getAlert: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('security_alerts')
        .select(`
          *,
          assigned_user:user_profiles!security_alerts_assigned_to_fkey(full_name, email),
          related_user:user_profiles!security_alerts_related_user_id_fkey(full_name, email)
        `)
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Security alert not found',
        })
      }

      return data
    }),

  // Update security alert (status, assignment, resolution)
  updateAlert: orgProtectedProcedure
    .input(updateSecurityAlertInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const serviceClient = getServiceClient()
      const { id, status, assignedTo, resolutionNotes, actionsTaken } = input

      const updates: Record<string, unknown> = {}
      if (status !== undefined) {
        updates.status = status
        if (status === 'resolved' || status === 'dismissed') {
          updates.resolved_at = new Date().toISOString()
        }
      }
      if (assignedTo !== undefined) updates.assigned_to = assignedTo
      if (resolutionNotes !== undefined) updates.resolution_notes = resolutionNotes
      if (actionsTaken !== undefined) updates.actions_taken = actionsTaken

      const { data, error } = await serviceClient
        .from('security_alerts')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update security alert',
        })
      }

      // Log the update
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'UPDATE',
        table_name: 'security_alerts',
        record_id: id,
        old_values: null,
        new_values: updates,
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  // ================== Alert Rules ==================

  // List alert rules
  listRules: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('alert_rules')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch alert rules',
        })
      }

      return data ?? []
    }),

  // Create alert rule
  createRule: orgProtectedProcedure
    .input(alertRuleInput)
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const serviceClient = getServiceClient()

      const { data, error } = await serviceClient
        .from('alert_rules')
        .insert({
          org_id: orgId,
          name: input.name,
          description: input.description,
          event_type: input.eventType,
          result_condition: input.resultCondition,
          threshold_count: input.thresholdCount,
          time_window_minutes: input.timeWindowMinutes,
          severity: input.severity,
          notification_channels: input.notificationChannels,
          auto_action: input.autoAction,
          is_active: input.isActive,
          created_by: user?.id,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'An alert rule with this name already exists',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create alert rule',
        })
      }

      // Log the creation
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'CREATE',
        table_name: 'alert_rules',
        record_id: data.id,
        new_values: input,
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  // Update alert rule
  updateRule: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      eventType: z.string(),
      resultCondition: z.enum(['ANY', 'SUCCESS', 'FAILURE']).default('ANY'),
      thresholdCount: z.number().min(1).max(100).default(5),
      timeWindowMinutes: z.number().min(1).max(1440).default(10),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      notificationChannels: z.object({
        dashboard: z.boolean().default(true),
        email: z.array(z.string().email()).optional(),
      }).default({ dashboard: true }),
      autoAction: z.enum(['none', 'lock_account', 'block_ip', 'require_2fa', 'notify_manager']).default('none'),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const serviceClient = getServiceClient()
      const { id, ...updates } = input

      // Get current rule for audit log
      const { data: currentRule } = await serviceClient
        .from('alert_rules')
        .select('*')
        .eq('id', id)
        .eq('org_id', orgId)
        .single()

      const { data, error } = await serviceClient
        .from('alert_rules')
        .update({
          name: updates.name,
          description: updates.description,
          event_type: updates.eventType,
          result_condition: updates.resultCondition,
          threshold_count: updates.thresholdCount,
          time_window_minutes: updates.timeWindowMinutes,
          severity: updates.severity,
          notification_channels: updates.notificationChannels,
          auto_action: updates.autoAction,
          is_active: updates.isActive,
        })
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update alert rule',
        })
      }

      // Log the update
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'UPDATE',
        table_name: 'alert_rules',
        record_id: id,
        old_values: currentRule,
        new_values: updates,
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  // Delete alert rule
  deleteRule: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const serviceClient = getServiceClient()

      // Get current rule for audit log
      const { data: currentRule } = await serviceClient
        .from('alert_rules')
        .select('*')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      const { error } = await serviceClient
        .from('alert_rules')
        .delete()
        .eq('id', input.id)
        .eq('org_id', orgId)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete alert rule',
        })
      }

      // Log the deletion
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'DELETE',
        table_name: 'alert_rules',
        record_id: input.id,
        old_values: currentRule,
        result: 'SUCCESS',
        severity: 'MEDIUM',
      })

      return { success: true }
    }),

  // Toggle alert rule active status
  toggleRule: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { orgId, user } = ctx
      const serviceClient = getServiceClient()

      // Get current state
      const { data: currentRule, error: fetchError } = await serviceClient
        .from('alert_rules')
        .select('is_active')
        .eq('id', input.id)
        .eq('org_id', orgId)
        .single()

      if (fetchError || !currentRule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Alert rule not found',
        })
      }

      const newState = !currentRule.is_active

      const { data, error } = await serviceClient
        .from('alert_rules')
        .update({ is_active: newState })
        .eq('id', input.id)
        .eq('org_id', orgId)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle alert rule',
        })
      }

      // Log the toggle
      await serviceClient.from('audit_logs').insert({
        org_id: orgId,
        user_id: user?.id,
        user_email: user?.email,
        action: 'UPDATE',
        table_name: 'alert_rules',
        record_id: input.id,
        old_values: { is_active: currentRule.is_active },
        new_values: { is_active: newState },
        result: 'SUCCESS',
        severity: 'INFO',
      })

      return data
    }),

  // Get distinct values for filter dropdowns
  getFilterOptions: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const serviceClient = getServiceClient()

      // Get distinct users who have audit logs
      const { data: users } = await serviceClient
        .from('audit_logs')
        .select('user_id, user_email')
        .eq('org_id', orgId)
        .not('user_id', 'is', null)
        .limit(100)

      // Deduplicate users
      const uniqueUsers = Array.from(
        new Map((users ?? []).map(u => [u.user_id, u])).values()
      )

      // Get distinct actions
      const { data: actions } = await serviceClient
        .from('audit_logs')
        .select('action')
        .eq('org_id', orgId)
        .not('action', 'is', null)

      const uniqueActions = [...new Set((actions ?? []).map(a => a.action))]

      // Get distinct object types (table_name)
      const { data: objectTypes } = await serviceClient
        .from('audit_logs')
        .select('table_name')
        .eq('org_id', orgId)
        .not('table_name', 'is', null)

      const uniqueObjectTypes = [...new Set((objectTypes ?? []).map(o => o.table_name))]

      return {
        users: uniqueUsers,
        actions: uniqueActions,
        objectTypes: uniqueObjectTypes,
        severities: ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        results: ['SUCCESS', 'FAILURE'],
      }
    }),
})
