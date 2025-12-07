import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'
import { createClient } from '@supabase/supabase-js'

// Admin client to bypass RLS for dashboard counts
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  )
}

export const adminRouter = router({
  getSystemHealth: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      // Use admin client to bypass RLS for accurate counts
      const adminClient = getAdminClient()

      // 1. Get active users count - using is_active boolean column
      const { count: activeUsers } = await adminClient
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('is_active', true)
        .is('deleted_at', null)

      // 2. Get integrations count from integrations table
      const { data: integrations } = await adminClient
        .from('integrations')
        .select('status')
        .eq('org_id', orgId)
        .is('deleted_at', null)

      const totalIntegrations = integrations?.length ?? 0
      const activeIntegrations = integrations?.filter(i => i.status === 'active').length ?? 0

      // 3. Get pending approvals from workflow_approvals table
      const { count: pendingApprovals } = await adminClient
        .from('workflow_approvals')
        .select('*, workflow_executions!inner(org_id)', { count: 'exact', head: true })
        .eq('workflow_executions.org_id', orgId)
        .eq('status', 'pending')

      // 4. Calculate uptime from integration_health_logs (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: healthLogs } = await adminClient
        .from('integration_health_logs')
        .select('status')
        .eq('org_id', orgId)
        .gte('created_at', twentyFourHoursAgo)

      let uptime = 99.9 // Default fallback
      if (healthLogs && healthLogs.length > 0) {
        const successCount = healthLogs.filter(log => log.status === 'success').length
        uptime = Number(((successCount / healthLogs.length) * 100).toFixed(1))
      }

      // 5. Calculate storage used from file uploads
      // Sum file sizes from import_jobs, export_jobs, and organization_branding
      const [importJobsResult, exportJobsResult, brandingResult] = await Promise.all([
        adminClient
          .from('import_jobs')
          .select('file_size_bytes')
          .eq('org_id', orgId),
        adminClient
          .from('export_jobs')
          .select('file_size_bytes')
          .eq('org_id', orgId),
        adminClient
          .from('organization_branding')
          .select('file_size')
          .eq('org_id', orgId),
      ])

      const importSize = importJobsResult.data?.reduce((sum, job) => sum + (job.file_size_bytes || 0), 0) ?? 0
      const exportSize = exportJobsResult.data?.reduce((sum, job) => sum + (job.file_size_bytes || 0), 0) ?? 0
      const brandingSize = brandingResult.data?.reduce((sum, asset) => sum + (asset.file_size || 0), 0) ?? 0

      const totalStorageBytes = importSize + exportSize + brandingSize
      // Get storage quota from system_settings (default 100GB = 107374182400 bytes)
      const { data: storageQuotaSetting } = await adminClient
        .from('system_settings')
        .select('value')
        .eq('key', 'storage_quota_gb')
        .single()

      const storageQuotaGB = storageQuotaSetting?.value ? parseInt(String(storageQuotaSetting.value)) : 100
      const storageQuotaBytes = storageQuotaGB * 1024 * 1024 * 1024
      const storageUsedPercent = Math.min(99, Math.round((totalStorageBytes / storageQuotaBytes) * 100))

      return {
        activeUsers: activeUsers ?? 0,
        totalIntegrations,
        activeIntegrations,
        pendingApprovals: pendingApprovals ?? 0,
        uptime,
        storageUsed: storageUsedPercent || 0,
        storageTotal: storageQuotaGB,
      }
    }),

  getCriticalAlerts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // 6. Get security alerts (open or investigating)
      const { data: securityAlerts } = await adminClient
        .from('security_alerts')
        .select('id, title, description, severity, alert_type, status, created_at')
        .eq('org_id', orgId)
        .in('status', ['open', 'investigating'])
        .order('created_at', { ascending: false })
        .limit(10)

      // Also get high priority notifications as additional alerts
      const { data: notifications } = await adminClient
        .from('notifications')
        .select('id, title, body, category, created_at, priority')
        .eq('org_id', orgId)
        .eq('read', false)
        .in('priority', ['high', 'urgent'])
        .order('created_at', { ascending: false })
        .limit(5)

      // Combine security alerts and notifications
      const combinedAlerts: Array<{
        id: string
        title: string
        message: string | null
        type: string
        severity: 'critical' | 'warning'
        createdAt: string
      }> = []

      // Add security alerts first (higher priority)
      if (securityAlerts) {
        for (const alert of securityAlerts) {
          combinedAlerts.push({
            id: alert.id,
            title: alert.title,
            message: alert.description,
            type: alert.alert_type,
            severity: alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'critical' : 'warning',
            createdAt: alert.created_at,
          })
        }
      }

      // Add notifications
      if (notifications) {
        for (const notif of notifications) {
          combinedAlerts.push({
            id: notif.id,
            title: notif.title,
            message: notif.body,
            type: notif.category,
            severity: notif.priority === 'urgent' ? 'critical' : 'warning',
            createdAt: notif.created_at,
          })
        }
      }

      // Sort by createdAt and limit to 10
      return combinedAlerts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
    }),

  getRecentActivity: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { orgId } = ctx
      const adminClient = getAdminClient()

      // Get recent audit log entries
      const { data: activities } = await adminClient
        .from('audit_logs')
        .select('id, action, table_name, user_email, created_at, old_values, new_values')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20)

      return activities?.map(activity => ({
        id: activity.id,
        action: activity.action,
        entity: activity.table_name,
        actor: activity.user_email,
        timestamp: activity.created_at,
        details: activity.new_values,
      })) ?? []
    }),
})
