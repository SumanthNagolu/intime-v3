'use client'

import { useState } from 'react'
import { DashboardShell, DashboardSection, DashboardGrid } from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import {
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  FileText,
  UserX,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { AuditLogDetailModal } from './AuditLogDetailModal'
import { ExportAuditLogsDialog } from './ExportAuditLogsDialog'
import { SecurityAlertsSection } from './SecurityAlertsSection'
import Link from 'next/link'

export function AuditLogsPage() {
  // Filter state
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [userId, setUserId] = useState<string>('')
  const [action, setAction] = useState<string>('')
  const [objectType, setObjectType] = useState<string>('')
  const [result, setResult] = useState<string>('')
  const [severity, setSeverity] = useState<string>('')
  const [page, setPage] = useState(1)

  // Modal state
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)

  const utils = trpc.useUtils()

  // Queries
  const statsQuery = trpc.audit.getStats.useQuery({ hours: 24 })

  const logsQuery = trpc.audit.list.useQuery({
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    userId: userId && userId !== 'all' ? userId : undefined,
    action: action && action !== 'all' ? action : undefined,
    objectType: objectType && objectType !== 'all' ? objectType : undefined,
    result: result && result !== 'all' ? result as 'SUCCESS' | 'FAILURE' : undefined,
    severity: severity && severity !== 'all' ? severity as 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' : undefined,
    page,
    pageSize: 20,
  })

  const filterOptionsQuery = trpc.audit.getFilterOptions.useQuery()

  const handleRefresh = () => {
    utils.audit.getStats.invalidate()
    utils.audit.list.invalidate()
  }

  const resetFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setUserId('')
    setAction('')
    setObjectType('')
    setResult('')
    setSeverity('')
    setPage(1)
  }

  const getResultBadge = (resultValue: string | null) => {
    if (resultValue === 'SUCCESS') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
    }
    if (resultValue === 'FAILURE') {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  const getSeverityBadge = (severityValue: string | null) => {
    const colors: Record<string, string> = {
      INFO: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200',
      LOW: 'bg-blue-50 text-blue-700 border-blue-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
      CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    }
    return <Badge variant="outline" className={colors[severityValue || 'INFO']}>{severityValue || 'INFO'}</Badge>
  }

  return (
    <DashboardShell
      title="Audit Logs & Security Monitoring"
      description="Review audit trails, investigate security incidents, and monitor user activity"
      breadcrumbs={[
        { label: 'Admin', href: '/employee/admin' },
        { label: 'Audit Logs', href: '/employee/admin/audit' },
      ]}
      actions={
        <div className="flex gap-2">
          <Link href="/employee/admin/audit/rules">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Alert Rules
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* Security Overview Stats */}
      <DashboardSection title="Security Overview (Last 24 Hours)">
        {statsQuery.isLoading ? (
          <DashboardGrid columns={4}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-charcoal-100 p-6 animate-pulse">
                <div className="h-4 bg-charcoal-100 rounded w-24 mb-2" />
                <div className="h-8 bg-charcoal-100 rounded w-16" />
              </div>
            ))}
          </DashboardGrid>
        ) : (
          <DashboardGrid columns={4}>
            <StatsCard
              title="Total Events"
              value={statsQuery.data?.totalEvents.toLocaleString() ?? 0}
              icon={FileText}
            />
            <StatsCard
              title="Failed Logins"
              value={statsQuery.data?.failedLogins ?? 0}
              changeLabel={`${statsQuery.data?.failedLoginRate ?? 0}%`}
              icon={UserX}
              variant={Number(statsQuery.data?.failedLoginRate) > 1 ? 'warning' : 'default'}
            />
            <StatsCard
              title="Security Alerts"
              value={statsQuery.data?.securityAlerts ?? 0}
              icon={AlertTriangle}
              variant={Number(statsQuery.data?.securityAlerts) > 0 ? 'warning' : 'default'}
            />
            <StatsCard
              title="Data Exports"
              value={statsQuery.data?.dataExports ?? 0}
              icon={Download}
            />
          </DashboardGrid>
        )}
      </DashboardSection>

      {/* Security Alerts Section */}
      <SecurityAlertsSection />

      {/* Filters */}
      <DashboardSection title="Audit Logs">
        <div className="bg-white rounded-xl border border-charcoal-100 p-4 mb-4">
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search by email, record ID, or name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                  className="w-[150px]"
                  placeholder="From"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                  className="w-[150px]"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
              <Select value={userId} onValueChange={(v) => { setUserId(v); setPage(1) }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {filterOptionsQuery.data?.users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.user_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={action} onValueChange={(v) => { setAction(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {filterOptionsQuery.data?.actions.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={objectType} onValueChange={(v) => { setObjectType(v); setPage(1) }}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Objects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Objects</SelectItem>
                  {filterOptionsQuery.data?.objectTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={result} onValueChange={(v) => { setResult(v); setPage(1) }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILURE">Failure</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(1) }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="All Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  {filterOptionsQuery.data?.severities.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {logsQuery.isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : logsQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load audit logs. Please try again.
            </div>
          ) : !logsQuery.data?.items.length ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No audit logs found</p>
              <p className="text-sm text-charcoal-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-charcoal-100 bg-charcoal-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Object</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Result</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Severity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">IP</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {logsQuery.data.items.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-charcoal-50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLogId(log.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-charcoal-400" />
                            <div>
                              <p className="text-sm text-charcoal-900">
                                {format(new Date(log.created_at), 'MMM d, h:mm a')}
                              </p>
                              <p className="text-xs text-charcoal-500">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-charcoal-900 truncate max-w-[200px]">
                            {log.user_email || 'System'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{log.action}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-charcoal-900">{log.table_name}</p>
                          {log.object_name && (
                            <p className="text-xs text-charcoal-500 truncate max-w-[150px]">{log.object_name}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">{getResultBadge(log.result)}</td>
                        <td className="px-4 py-3">{getSeverityBadge(log.severity)}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-charcoal-600 font-mono">
                            {log.ip_address || '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLogId(log.id)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logsQuery.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-charcoal-100">
                  <p className="text-sm text-charcoal-500">
                    Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, logsQuery.data.pagination.total)} of {logsQuery.data.pagination.total.toLocaleString()} events
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= logsQuery.data.pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardSection>

      {/* Detail Modal */}
      <AuditLogDetailModal
        logId={selectedLogId}
        open={!!selectedLogId}
        onClose={() => setSelectedLogId(null)}
      />

      {/* Export Dialog */}
      <ExportAuditLogsDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </DashboardShell>
  )
}
