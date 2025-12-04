import { router } from '../trpc/init'
import { orgProtectedProcedure } from '../trpc/middleware'

export const adminRouter = router({
  getSystemHealth: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get active users count
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('is_active', true)

      // Get integrations count (using event_subscriptions as proxy)
      const { data: integrations } = await supabase
        .from('event_subscriptions')
        .select('is_active')
        .eq('org_id', orgId)

      const totalIntegrations = integrations?.length ?? 0
      const activeIntegrations = integrations?.filter(i => i.is_active).length ?? 0

      // Get pending approvals count
      const { count: pendingApprovals } = await supabase
        .from('approval_instances')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'pending')

      return {
        activeUsers: activeUsers ?? 0,
        totalIntegrations,
        activeIntegrations,
        pendingApprovals: pendingApprovals ?? 0,
        // Mocked for now - would require system monitoring
        uptime: 99.9,
        storageUsed: 45,
        storageTotal: 100,
      }
    }),

  getCriticalAlerts: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get high priority notifications as alerts
      const { data: alerts } = await supabase
        .from('notifications')
        .select('id, title, message, notification_type, created_at, priority')
        .eq('org_id', orgId)
        .eq('is_archived', false)
        .in('priority', ['high', 'urgent'])
        .order('created_at', { ascending: false })
        .limit(10)

      return alerts?.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        type: alert.notification_type,
        severity: alert.priority === 'urgent' ? 'critical' as const : 'warning' as const,
        createdAt: alert.created_at,
      })) ?? []
    }),

  getRecentActivity: orgProtectedProcedure
    .query(async ({ ctx }) => {
      const { supabase, orgId } = ctx

      // Get recent audit log entries
      const { data: activities } = await supabase
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
