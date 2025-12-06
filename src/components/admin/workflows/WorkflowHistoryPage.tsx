'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Timer,
} from 'lucide-react'
import { type ExecutionStatus, type ApprovalStatus } from '@/lib/workflows/types'

interface WorkflowHistoryPageProps {
  workflowId: string
}

const EXECUTION_STATUS_CONFIG: Record<ExecutionStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <Play className="w-3 h-3" /> },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
  escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-700', icon: <RefreshCw className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-charcoal-100 text-charcoal-700', icon: <XCircle className="w-3 h-3" /> },
  expired: { label: 'Expired', color: 'bg-charcoal-100 text-charcoal-500', icon: <Timer className="w-3 h-3" /> },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
}

const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-700' },
  expired: { label: 'Expired', color: 'bg-charcoal-100 text-charcoal-500' },
  delegated: { label: 'Delegated', color: 'bg-blue-100 text-blue-700' },
}

export function WorkflowHistoryPage({ workflowId }: WorkflowHistoryPageProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  // Queries
  const workflowQuery = trpc.workflows.getById.useQuery({ id: workflowId })
  const historyQuery = trpc.workflows.getExecutionHistory.useQuery({
    workflowId,
    page,
    limit: 20,
    status: statusFilter !== 'all' ? statusFilter as ExecutionStatus : undefined,
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Workflows', href: '/employee/admin/workflows' },
    { label: workflowQuery.data?.name || 'Loading...', href: `/employee/admin/workflows/${workflowId}` },
    { label: 'Execution History' },
  ]

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (workflowQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
        </div>
      </DashboardShell>
    )
  }

  const workflow = workflowQuery.data
  const executions = historyQuery.data?.executions || []
  const totalPages = historyQuery.data?.totalPages || 1

  return (
    <DashboardShell
      title={`Execution History: ${workflow?.name || 'Unknown'}`}
      description={`View past workflow executions and their outcomes`}
      breadcrumbs={breadcrumbs}
      actions={
        <Button variant="outline" onClick={() => router.push(`/employee/admin/workflows/${workflowId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workflow
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-charcoal-50 rounded-lg text-center">
            <p className="text-2xl font-semibold">{historyQuery.data?.totalCount || 0}</p>
            <p className="text-sm text-charcoal-500">Total Executions</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-2xl font-semibold text-emerald-600">{historyQuery.data?.completedCount || 0}</p>
            <p className="text-sm text-charcoal-500">Completed</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-semibold text-blue-600">{historyQuery.data?.inProgressCount || 0}</p>
            <p className="text-sm text-charcoal-500">In Progress</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-semibold text-red-600">{historyQuery.data?.failedCount || 0}</p>
            <p className="text-sm text-charcoal-500">Failed</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-semibold text-amber-600">{historyQuery.data?.pendingCount || 0}</p>
            <p className="text-sm text-charcoal-500">Pending</p>
          </div>
        </div>

        {/* Filters */}
        <DashboardSection title="Execution Log">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by entity ID..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(EXECUTION_STATUS_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Executions Table */}
          {historyQuery.isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : executions.length === 0 ? (
            <div className="p-12 text-center bg-charcoal-50 rounded-lg">
              <FileText className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
              <h3 className="text-sm font-medium text-charcoal-700">No Executions Found</h3>
              <p className="text-sm text-charcoal-500 mt-1">
                {statusFilter !== 'all'
                  ? 'No executions match the selected filter'
                  : 'This workflow has not been executed yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => {
                const statusConfig = EXECUTION_STATUS_CONFIG[execution.status as ExecutionStatus]
                const isExpanded = expandedRows[execution.id]

                return (
                  <div
                    key={execution.id}
                    className="border border-charcoal-200 rounded-lg overflow-hidden"
                  >
                    {/* Main Row */}
                    <button
                      onClick={() => toggleRow(execution.id)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-charcoal-50 text-left"
                    >
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-charcoal-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-charcoal-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {execution.entity_type}: {execution.entity_id.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-charcoal-500">
                            Started: {new Date(execution.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                        {execution.current_step && (
                          <span className="text-xs text-charcoal-500">
                            Step {execution.current_step}
                          </span>
                        )}
                        {execution.completed_at && (
                          <span className="text-xs text-charcoal-500">
                            Duration: {getDuration(execution.started_at, execution.completed_at)}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 py-4 bg-charcoal-50 border-t border-charcoal-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-charcoal-500">Execution ID</p>
                            <p className="font-mono text-xs">{execution.id}</p>
                          </div>
                          <div>
                            <p className="text-charcoal-500">Entity ID</p>
                            <p className="font-mono text-xs">{execution.entity_id}</p>
                          </div>
                          <div>
                            <p className="text-charcoal-500">Version</p>
                            <p>v{execution.workflow_version}</p>
                          </div>
                          <div>
                            <p className="text-charcoal-500">Completed</p>
                            <p>
                              {execution.completed_at
                                ? new Date(execution.completed_at).toLocaleString()
                                : 'In progress'}
                            </p>
                          </div>
                        </div>

                        {/* Error Message */}
                        {execution.error_message && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Error</p>
                                <p className="text-sm text-red-600">{execution.error_message}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Completion Notes */}
                        {execution.completion_notes && (
                          <div className="mb-4 p-3 bg-charcoal-100 rounded-lg">
                            <p className="text-sm text-charcoal-600">{execution.completion_notes}</p>
                          </div>
                        )}

                        {/* Approvals */}
                        {execution.approvals && execution.approvals.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Approval History</h4>
                            <div className="space-y-2">
                              {execution.approvals.map((approval) => {
                                const approvalStatusConfig = APPROVAL_STATUS_CONFIG[approval.status as ApprovalStatus]
                                return (
                                  <div
                                    key={approval.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-charcoal-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 rounded-full bg-charcoal-200 flex items-center justify-center text-xs">
                                        {approval.step_order}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">
                                          Step {approval.step_order}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-charcoal-500">
                                          <User className="w-3 h-3" />
                                          <span>Approver: {approval.approver_id.substring(0, 8)}...</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <Badge className={approvalStatusConfig.color}>
                                        {approvalStatusConfig.label}
                                      </Badge>
                                      <p className="text-xs text-charcoal-500 mt-1">
                                        {approval.responded_at
                                          ? new Date(approval.responded_at).toLocaleString()
                                          : 'Awaiting response'}
                                      </p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        {execution.metadata && Object.keys(execution.metadata).length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Metadata</h4>
                            <pre className="p-3 bg-white rounded-lg border border-charcoal-200 text-xs font-mono overflow-x-auto">
                              {JSON.stringify(execution.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-charcoal-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </DashboardSection>
      </div>
    </DashboardShell>
  )
}

// Helper function to calculate duration
function getDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
