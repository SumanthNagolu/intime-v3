'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  FileText,
  AlertTriangle,
  Forward,
  RefreshCw,
  Filter,
  Calendar,
  Building,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { type ApprovalStatus, type EntityType } from '@/lib/workflows/types'

const ENTITY_TYPE_ICONS: Record<EntityType, React.ReactNode> = {
  jobs: <Briefcase className="w-4 h-4" />,
  candidates: <User className="w-4 h-4" />,
  submissions: <FileText className="w-4 h-4" />,
  placements: <CheckCircle className="w-4 h-4" />,
  accounts: <Building className="w-4 h-4" />,
  contacts: <User className="w-4 h-4" />,
  leads: <User className="w-4 h-4" />,
  deals: <Briefcase className="w-4 h-4" />,
  activities: <Calendar className="w-4 h-4" />,
  employees: <User className="w-4 h-4" />,
  consultants: <User className="w-4 h-4" />,
  vendors: <Building className="w-4 h-4" />,
  interviews: <Calendar className="w-4 h-4" />,
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  jobs: 'Jobs',
  candidates: 'Candidates',
  submissions: 'Submissions',
  placements: 'Placements',
  accounts: 'Accounts',
  contacts: 'Contacts',
  leads: 'Leads',
  deals: 'Deals',
  activities: 'Activities',
  employees: 'Employees',
  consultants: 'Consultants',
  vendors: 'Vendors',
  interviews: 'Interviews',
}

const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  escalated: { label: 'Escalated', color: 'bg-orange-100 text-orange-700' },
  expired: { label: 'Expired', color: 'bg-charcoal-100 text-charcoal-500' },
  delegated: { label: 'Delegated', color: 'bg-blue-100 text-blue-700' },
}

interface ApprovalItem {
  id: string
  execution_id: string
  step_id: string
  step_order: number
  step_name: string
  status: ApprovalStatus
  requested_at: string
  due_at: string | null
  workflow_name: string
  workflow_type: string
  entity_type: EntityType
  entity_id: string
  entity_name?: string
  submitter_name?: string
  submitter_email?: string
  is_overdue: boolean
  time_remaining?: string
}

export function ApprovalsQueuePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delegate' | null>(null)
  const [responseNotes, setResponseNotes] = useState('')
  const [delegateUserId, setDelegateUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock query for approvals queue - will be replaced with actual tRPC procedure
  const approvalsQuery = trpc.workflows.getStats.useQuery()

  const utils = trpc.useUtils()

  // Mock data for demonstration
  const mockApprovals: ApprovalItem[] = [
    {
      id: '1',
      execution_id: 'exec-1',
      step_id: 'step-1',
      step_order: 1,
      step_name: 'Manager Approval',
      status: 'pending',
      requested_at: new Date(Date.now() - 3600000).toISOString(),
      due_at: new Date(Date.now() + 86400000).toISOString(),
      workflow_name: 'Job Posting Approval',
      workflow_type: 'approval',
      entity_type: 'jobs',
      entity_id: 'job-123',
      entity_name: 'Senior Software Engineer',
      submitter_name: 'John Smith',
      submitter_email: 'john@company.com',
      is_overdue: false,
      time_remaining: '23h 15m',
    },
    {
      id: '2',
      execution_id: 'exec-2',
      step_id: 'step-2',
      step_order: 2,
      step_name: 'Director Review',
      status: 'pending',
      requested_at: new Date(Date.now() - 7200000).toISOString(),
      due_at: new Date(Date.now() - 3600000).toISOString(),
      workflow_name: 'High Value Placement',
      workflow_type: 'approval',
      entity_type: 'placements',
      entity_id: 'placement-456',
      entity_name: 'Enterprise Client Placement',
      submitter_name: 'Jane Doe',
      submitter_email: 'jane@company.com',
      is_overdue: true,
    },
  ]

  const filteredApprovals = mockApprovals.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false
    if (entityFilter !== 'all' && item.entity_type !== entityFilter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        item.workflow_name.toLowerCase().includes(searchLower) ||
        item.entity_name?.toLowerCase().includes(searchLower) ||
        item.submitter_name?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const handleAction = async () => {
    if (!selectedApproval || !actionType) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success(
        actionType === 'approve'
          ? 'Request approved successfully'
          : actionType === 'reject'
          ? 'Request rejected'
          : 'Request delegated'
      )

      setSelectedApproval(null)
      setActionType(null)
      setResponseNotes('')
      setDelegateUserId('')
      // Invalidate queries
    } catch {
      toast.error('Failed to process action')
    } finally {
      setIsSubmitting(false)
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Workflows', href: '/employee/admin/workflows' },
    { label: 'Approvals Queue' },
  ]

  const pendingCount = mockApprovals.filter(a => a.status === 'pending').length
  const overdueCount = mockApprovals.filter(a => a.is_overdue).length

  return (
    <DashboardShell
      title="Approvals Queue"
      description="Review and process pending approval requests"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-amber-700">{pendingCount}</p>
                <p className="text-sm text-amber-600">Pending Approvals</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-red-700">{overdueCount}</p>
                <p className="text-sm text-red-600">Overdue</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-emerald-700">12</p>
                <p className="text-sm text-emerald-600">Approved Today</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="p-4 bg-charcoal-50 rounded-lg border border-charcoal-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-charcoal-700">2.4h</p>
                <p className="text-sm text-charcoal-500">Avg Response Time</p>
              </div>
              <RefreshCw className="w-8 h-8 text-charcoal-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <DashboardSection title="Pending Requests">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by workflow, entity, or submitter..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approvals List */}
          {filteredApprovals.length === 0 ? (
            <div className="p-12 text-center bg-charcoal-50 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
              <h3 className="text-sm font-medium text-charcoal-700">All Caught Up!</h3>
              <p className="text-sm text-charcoal-500 mt-1">
                No pending approvals match your filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className={`p-4 bg-white rounded-lg border ${
                    approval.is_overdue
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-charcoal-200'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-charcoal-100 rounded-lg">
                        {ENTITY_TYPE_ICONS[approval.entity_type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-charcoal-900 truncate">
                            {approval.entity_name || `${approval.entity_type} ${approval.entity_id.substring(0, 8)}`}
                          </h3>
                          {approval.is_overdue && (
                            <Badge className="bg-red-100 text-red-700">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-charcoal-500 mb-2">
                          {approval.workflow_name} &middot; {approval.step_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {approval.submitter_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Requested: {new Date(approval.requested_at).toLocaleString()}
                          </span>
                          {approval.time_remaining && !approval.is_overdue && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Clock className="w-3 h-3" />
                              {approval.time_remaining} remaining
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval)
                          setActionType('reject')
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval)
                          setActionType('approve')
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedApproval(approval)
                          setActionType('delegate')
                        }}
                      >
                        <Forward className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardSection>
      </div>

      {/* Action Dialog */}
      <Dialog
        open={!!selectedApproval && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApproval(null)
            setActionType(null)
            setResponseNotes('')
            setDelegateUserId('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'delegate' && 'Delegate Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Confirm approval for this request'}
              {actionType === 'reject' && 'Please provide a reason for rejection'}
              {actionType === 'delegate' && 'Select another user to handle this request'}
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              {/* Request Summary */}
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <p className="font-medium">{selectedApproval.entity_name}</p>
                <p className="text-sm text-charcoal-500">
                  {selectedApproval.workflow_name} &middot; {selectedApproval.step_name}
                </p>
              </div>

              {/* Delegate User Select */}
              {actionType === 'delegate' && (
                <div>
                  <label className="text-sm font-medium">Delegate To</label>
                  <Input
                    value={delegateUserId}
                    onChange={(e) => setDelegateUserId(e.target.value)}
                    placeholder="Enter user ID or email"
                    className="mt-1"
                  />
                </div>
              )}

              {/* Response Notes */}
              <div>
                <label className="text-sm font-medium">
                  {actionType === 'reject' ? 'Rejection Reason *' : 'Notes (Optional)'}
                </label>
                <Textarea
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder={
                    actionType === 'reject'
                      ? 'Please explain why this request is being rejected...'
                      : 'Add any notes about this decision...'
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedApproval(null)
                setActionType(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={
                isSubmitting ||
                (actionType === 'reject' && !responseNotes) ||
                (actionType === 'delegate' && !delegateUserId)
              }
              className={
                actionType === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : actionType === 'reject'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-hublot-900 hover:bg-hublot-800 text-white'
              }
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionType === 'approve' && 'Confirm Approval'}
              {actionType === 'reject' && 'Confirm Rejection'}
              {actionType === 'delegate' && 'Delegate Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
