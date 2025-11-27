/**
 * Admin Audit Log Server Actions
 *
 * Provides operations for viewing and exporting audit logs with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/admin-audit
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ActionResult, PaginatedResult } from './types';
import {
  getCurrentUserContext,
  checkPermission,
  calculatePagination,
  calculateRange,
} from './helpers';

// ============================================================================
// Types
// ============================================================================

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  tableName: string;
  action: string;
  recordId: string | null;
  userId: string | null;
  userEmail: string | null;
  userIpAddress: string | null;
  userAgent: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  changedFields: string[] | null;
  metadata: Record<string, unknown> | null;
  severity: string | null;
  orgId: string | null;
}

export interface AuditLogDetail extends AuditLogEntry {
  user?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  userId?: string;
  action?: string;
  tableName?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Validation Schemas
// ============================================================================

const auditLogFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  tableName: z.string().optional(),
  severity: z.enum(['debug', 'info', 'warning', 'error', 'critical']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const exportFiltersSchema = z.object({
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  tableName: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get paginated audit logs with filtering.
 */
export async function getAuditLogsAction(
  filters: AuditLogFilters = {}
): Promise<ActionResult<PaginatedResult<AuditLogEntry>>> {
  // Validate input
  const validation = auditLogFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const {
    page,
    pageSize,
    search,
    userId,
    action,
    tableName,
    severity,
    startDate,
    endDate,
    sortOrder,
  } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'audit_logs', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: audit_logs:read required' };
  }

  // Build query - RLS automatically filters by org_id
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      created_at,
      table_name,
      action,
      record_id,
      user_id,
      user_email,
      user_ip_address,
      user_agent,
      old_values,
      new_values,
      changed_fields,
      metadata,
      severity,
      org_id
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (search) {
    query = query.or(
      `user_email.ilike.%${search}%,table_name.ilike.%${search}%,action.ilike.%${search}%`
    );
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (action) {
    query = query.eq('action', action);
  }

  if (tableName) {
    query = query.eq('table_name', tableName);
  }

  if (severity) {
    query = query.eq('severity', severity);
  }

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  // Apply sorting
  query = query.order('created_at', { ascending: sortOrder === 'asc' });

  // Apply pagination
  const { from, to } = calculateRange(page, pageSize);
  query = query.range(from, to);

  const { data: logs, error, count } = await query;

  if (error) {
    console.error('Get audit logs error:', error);
    return { success: false, error: 'Failed to fetch audit logs' };
  }

  // Transform data
  const transformedLogs: AuditLogEntry[] = (logs || []).map((log: any) => ({
    id: log.id,
    createdAt: log.created_at,
    tableName: log.table_name,
    action: log.action,
    recordId: log.record_id,
    userId: log.user_id,
    userEmail: log.user_email,
    userIpAddress: (log.user_ip_address as string | null) ?? null,
    userAgent: log.user_agent ?? null,
    oldValues: (log.old_values as Record<string, unknown> | null) ?? null,
    newValues: (log.new_values as Record<string, unknown> | null) ?? null,
    changedFields: log.changed_fields,
    metadata: (log.metadata as Record<string, unknown> | null) ?? null,
    severity: log.severity ?? null,
    orgId: log.org_id ?? null,
  }));

  const total = count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: transformedLogs,
      ...pagination,
    },
  };
}

/**
 * Get a single audit log entry with full details.
 */
export async function getAuditLogDetailAction(
  logId: string
): Promise<ActionResult<AuditLogDetail>> {
  if (!logId || !z.string().uuid().safeParse(logId).success) {
    return { success: false, error: 'Invalid log ID' };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'audit_logs', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: audit_logs:read required' };
  }

  // Fetch log with user details
  const { data: log, error } = await supabase
    .from('audit_logs')
    .select(
      `
      id,
      created_at,
      table_name,
      action,
      record_id,
      user_id,
      user_email,
      user_ip_address,
      user_agent,
      old_values,
      new_values,
      changed_fields,
      metadata,
      severity,
      org_id,
      user_profiles (
        id,
        email,
        full_name
      )
    `
    )
    .eq('id', logId)
    .single();

  if (error || !log) {
    return { success: false, error: 'Audit log not found' };
  }

  const transformedLog: AuditLogDetail = {
    id: log.id!,
    createdAt: log.created_at!,
    tableName: log.table_name!,
    action: log.action!,
    recordId: log.record_id ?? null,
    userId: log.user_id ?? null,
    userEmail: log.user_email ?? null,
    userIpAddress: (log.user_ip_address as string | null) ?? null,
    userAgent: log.user_agent ?? null,
    oldValues: (log.old_values as Record<string, unknown> | null) ?? null,
    newValues: (log.new_values as Record<string, unknown> | null) ?? null,
    changedFields: log.changed_fields ?? null,
    metadata: (log.metadata as Record<string, unknown> | null) ?? null,
    severity: log.severity ?? null,
    orgId: log.org_id ?? null,
    user: log.user_profiles
      ? {
          id: (log.user_profiles as any).id,
          email: (log.user_profiles as any).email,
          fullName: (log.user_profiles as any).full_name,
        }
      : null,
  };

  return { success: true, data: transformedLog };
}

/**
 * Export audit logs as CSV data.
 */
export async function exportAuditLogsAction(
  filters: z.infer<typeof exportFiltersSchema>
): Promise<ActionResult<{ csv: string; filename: string }>> {
  // Validate input
  const validation = exportFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { startDate, endDate, tableName, action, userId } = validation.data;

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'audit_logs', 'export');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: audit_logs:export required' };
  }

  // Build query
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      created_at,
      table_name,
      action,
      record_id,
      user_email,
      user_ip_address,
      severity,
      metadata
    `
    )
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (tableName) {
    query = query.eq('table_name', tableName);
  }

  if (action) {
    query = query.eq('action', action);
  }

  if (userId) {
    query = query.eq('user_id', userId);
  }

  // Limit to 10000 records for export
  query = query.limit(10000);

  const { data: logs, error } = await query;

  if (error) {
    console.error('Export audit logs error:', error);
    return { success: false, error: 'Failed to export audit logs' };
  }

  if (!logs || logs.length === 0) {
    return { success: false, error: 'No audit logs found for the specified criteria' };
  }

  // Generate CSV
  const headers = [
    'ID',
    'Timestamp',
    'Table',
    'Action',
    'Record ID',
    'User Email',
    'IP Address',
    'Severity',
  ];

  const rows = logs.map((log: any) => [
    log.id,
    log.created_at,
    log.table_name,
    log.action,
    log.record_id || '',
    log.user_email || '',
    log.user_ip_address || '',
    log.severity,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  // Generate filename
  const startDateStr = startDate.split('T')[0];
  const endDateStr = endDate.split('T')[0];
  const filename = `audit-logs-${startDateStr}-to-${endDateStr}.csv`;

  return {
    success: true,
    data: {
      csv: csvContent,
      filename,
    },
  };
}

/**
 * Get unique values for audit log filters (for dropdown options).
 */
export async function getAuditLogFilterOptionsAction(): Promise<
  ActionResult<{
    actions: string[];
    tableNames: string[];
    severities: string[];
  }>
> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'audit_logs', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: audit_logs:read required' };
  }

  // Get distinct actions
  const { data: actionsData } = await supabase
    .from('audit_logs')
    .select('action')
    .order('action', { ascending: true });

  // Get distinct table names
  const { data: tablesData } = await supabase
    .from('audit_logs')
    .select('table_name')
    .order('table_name', { ascending: true });

  // Extract unique values
  const actions = [...new Set((actionsData || []).map((a: any) => a.action))];
  const tableNames = [...new Set((tablesData || []).map((t: any) => t.table_name))];
  const severities = ['debug', 'info', 'warning', 'error', 'critical'];

  return {
    success: true,
    data: {
      actions,
      tableNames,
      severities,
    },
  };
}

/**
 * Get audit log statistics for the dashboard.
 */
export async function getAuditLogStatsAction(): Promise<
  ActionResult<{
    totalLogs: number;
    logsToday: number;
    warningsToday: number;
    errorsToday: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ email: string; count: number }>;
  }>
> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'audit_logs', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: audit_logs:read required' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // Get total count
  const { count: totalLogs } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  // Get logs today
  const { count: logsToday } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStr);

  // Get warnings today
  const { count: warningsToday } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStr)
    .eq('severity', 'warning');

  // Get errors today
  const { count: errorsToday } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStr)
    .in('severity', ['error', 'critical']);

  // Get top actions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  const { data: actionsData } = await supabase
    .from('audit_logs')
    .select('action')
    .gte('created_at', sevenDaysAgoStr);

  // Count actions
  const actionCounts: Record<string, number> = {};
  (actionsData || []).forEach((a: any) => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
  });

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Get top users (last 7 days)
  const { data: usersData } = await supabase
    .from('audit_logs')
    .select('user_email')
    .gte('created_at', sevenDaysAgoStr)
    .not('user_email', 'is', null);

  // Count users
  const userCounts: Record<string, number> = {};
  (usersData || []).forEach((u: any) => {
    if (u.user_email) {
      userCounts[u.user_email] = (userCounts[u.user_email] || 0) + 1;
    }
  });

  const topUsers = Object.entries(userCounts)
    .map(([email, count]) => ({ email, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    success: true,
    data: {
      totalLogs: totalLogs || 0,
      logsToday: logsToday || 0,
      warningsToday: warningsToday || 0,
      errorsToday: errorsToday || 0,
      topActions,
      topUsers,
    },
  };
}
