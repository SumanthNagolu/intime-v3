/**
 * tRPC Router: Admin Metrics
 * Provides real-time dashboard metrics for System Administrator role
 */

import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, sql, desc, isNotNull } from 'drizzle-orm';

export const adminMetricsRouter = router({
  /**
   * Get total users count
   */
  getTotalUsers: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const [activeData, inactiveData] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(
          eq(userProfiles.orgId, orgId),
          eq(userProfiles.isActive, true)
        )),

      db.select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(
          eq(userProfiles.orgId, orgId),
          eq(userProfiles.isActive, false)
        )),
    ]);

    const active = activeData[0]?.count || 0;
    const inactive = inactiveData[0]?.count || 0;

    return {
      value: active,
      label: `${active} active, ${inactive} inactive`,
      trend: 'neutral' as const,
    };
  }),

  /**
   * Get active sessions (mock - would need session tracking)
   */
  getActiveSessions: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock data - would need session tracking table
    return {
      value: 24,
      label: 'Users currently online',
      trend: 'up' as const,
      change: 8,
    };
  }),

  /**
   * Get system health metrics
   */
  getSystemHealth: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock system health - would integrate with monitoring
    return {
      value: 99.9,
      label: '99.9% uptime this month',
      trend: 'up' as const,
    };
  }),

  /**
   * Get pending user requests
   */
  getPendingUserRequests: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock data - would need user_requests table
    return [
      {
        id: '1',
        title: 'New Account Request',
        subtitle: 'john.doe@company.com - Recruiter role',
        status: 'Pending',
        statusColor: 'warning' as const,
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        title: 'Role Change Request',
        subtitle: 'sarah.smith@company.com - Manager access',
        status: 'Pending',
        statusColor: 'warning' as const,
        timestamp: '1 day ago',
      },
      {
        id: '3',
        title: 'Password Reset',
        subtitle: 'mike.jones@company.com',
        status: 'Pending',
        statusColor: 'warning' as const,
        timestamp: '3 hours ago',
      },
    ];
  }),

  /**
   * Get recent logins
   */
  getRecentLogins: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get users with recent activity (using updatedAt as proxy)
    const recentUsers = await db.select({
      id: userProfiles.id,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      email: userProfiles.email,
      updatedAt: userProfiles.updatedAt,
    })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.isActive, true)
      ))
      .orderBy(desc(userProfiles.updatedAt))
      .limit(10);

    return recentUsers.map((user) => ({
      id: user.id,
      title: `${user.firstName} ${user.lastName}`,
      subtitle: user.email,
      status: 'Active',
      statusColor: 'success' as const,
      timestamp: user.updatedAt?.toLocaleString() || 'Unknown',
    }));
  }),

  /**
   * Get audit activity log
   */
  getAuditActivity: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock audit log - would need audit_logs table
    return [
      {
        id: '1',
        title: 'User Role Changed',
        subtitle: 'Admin changed role for sarah.smith@company.com',
        status: 'Info',
        statusColor: 'default' as const,
        timestamp: '10 minutes ago',
      },
      {
        id: '2',
        title: 'Failed Login Attempt',
        subtitle: 'Multiple failed attempts for unknown@company.com',
        status: 'Warning',
        statusColor: 'warning' as const,
        timestamp: '1 hour ago',
      },
      {
        id: '3',
        title: 'System Configuration Changed',
        subtitle: 'Integration settings updated',
        status: 'Info',
        statusColor: 'default' as const,
        timestamp: '3 hours ago',
      },
      {
        id: '4',
        title: 'Bulk Data Export',
        subtitle: 'Candidates exported by recruiter@company.com',
        status: 'Info',
        statusColor: 'default' as const,
        timestamp: '5 hours ago',
      },
    ];
  }),

  /**
   * Get integration status
   */
  getIntegrationStatus: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock integration status - would check actual integrations
    return [
      {
        id: 'gusto',
        title: 'Gusto Payroll',
        subtitle: 'Last sync: 2 hours ago',
        status: 'Connected',
        statusColor: 'success' as const,
        timestamp: 'Healthy',
      },
      {
        id: 'linkedin',
        title: 'LinkedIn Recruiter',
        subtitle: 'Last sync: 30 minutes ago',
        status: 'Connected',
        statusColor: 'success' as const,
        timestamp: 'Healthy',
      },
      {
        id: 'gmail',
        title: 'Gmail Integration',
        subtitle: 'Last sync: 5 minutes ago',
        status: 'Connected',
        statusColor: 'success' as const,
        timestamp: 'Healthy',
      },
      {
        id: 'slack',
        title: 'Slack Notifications',
        subtitle: 'Token expires in 7 days',
        status: 'Warning',
        statusColor: 'warning' as const,
        timestamp: 'Renew Soon',
      },
    ];
  }),

  /**
   * Get role distribution
   */
  getRoleDistribution: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get user count by employee role (simplified role distribution)
    const distribution = await db.select({
      role: userProfiles.employeeRole,
      count: sql<number>`count(*)::int`,
    })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.isActive, true),
        isNotNull(userProfiles.employeeRole)
      ))
      .groupBy(userProfiles.employeeRole);

    const colors: Record<string, string> = {
      admin: '#D87254',
      recruiter: '#10B981',
      manager: '#3B82F6',
      trainer: '#8B5CF6',
      executive: '#F59E0B',
    };

    return distribution.map((item) => ({
      label: item.role || 'Unknown',
      value: item.count,
      color: colors[item.role || ''] || '#6B7280',
    }));
  }),

  /**
   * Get storage usage (mock)
   */
  getStorageUsage: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock storage data
    return [
      { label: 'Resumes', value: 2.4, color: '#D87254' },
      { label: 'Documents', value: 1.8, color: '#10B981' },
      { label: 'Attachments', value: 0.9, color: '#3B82F6' },
      { label: 'Backups', value: 3.2, color: '#8B5CF6' },
    ];
  }),

  /**
   * Get security alerts
   */
  getSecurityAlerts: orgProtectedProcedure.query(async ({ ctx: _ctx }) => {
    // Mock security alerts
    return [
      {
        id: '1',
        title: 'Multiple Failed Login Attempts',
        subtitle: 'IP: 192.168.1.100 - 5 attempts in 10 minutes',
        status: 'Warning',
        statusColor: 'warning' as const,
        timestamp: '30 minutes ago',
      },
    ];
  }),
});
