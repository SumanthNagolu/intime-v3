'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  History,
  Loader2,
  CalendarDays,
  Timer,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Approval',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  approved: {
    label: 'Approved',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
    icon: XCircle,
    iconColor: 'text-charcoal-500',
    bgColor: 'bg-charcoal-50',
  },
}

const LEAVE_TYPE_CONFIG = {
  vacation: { label: 'Vacation', icon: '🏖️', color: 'bg-blue-100 text-blue-700' },
  sick: { label: 'Sick Leave', icon: '🤒', color: 'bg-red-100 text-red-700' },
  personal: { label: 'Personal', icon: '👤', color: 'bg-purple-100 text-purple-700' },
  bereavement: { label: 'Bereavement', icon: '🖤', color: 'bg-charcoal-100 text-charcoal-700' },
  jury_duty: { label: 'Jury Duty', icon: '⚖️', color: 'bg-indigo-100 text-indigo-700' },
  parental: { label: 'Parental Leave', icon: '👶', color: 'bg-pink-100 text-pink-700' },
  unpaid: { label: 'Unpaid Leave', icon: '📅', color: 'bg-amber-100 text-amber-700' },
  holiday: { label: 'Holiday', icon: '🎉', color: 'bg-green-100 text-green-700' },
  other: { label: 'Other', icon: '📋', color: 'bg-charcoal-100 text-charcoal-700' },
}

export default function LeaveRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const utils = trpc.useUtils()

  // Fetch request data with employee info
  const { data: requestsData, isLoading } = trpc.leave.requests.list.useQuery({
    page: 1,
    pageSize: 100,
  })

  // Find the specific request
  const request = requestsData?.items.find(r => r.id === id)
  const employee = request?.employee as {
    id: string
    job_title: string
    department: string
    user: { full_name: string; avatar_url?: string }
  } | undefined

  // Get employee balances
  const { data: balances } = trpc.leave.balances.getByEmployee.useQuery(
    { employeeId: employee?.id ?? '' },
    { enabled: !!employee?.id }
  )

  // Mutations
  const approveRejectMutation = trpc.leave.requests.approveReject.useMutation({
    onSuccess: () => {
      utils.leave.requests.list.invalidate()
      utils.leave.stats.invalidate()
      setShowApproveDialog(false)
      setShowRejectDialog(false)
    },
  })

  const cancelMutation = trpc.leave.requests.cancel.useMutation({
    onSuccess: () => {
      utils.leave.requests.list.invalidate()
      utils.leave.stats.invalidate()
      setShowCancelDialog(false)
    },
  })

  const handleApprove = () => {
    approveRejectMutation.mutate({
      id,
      action: 'approve',
    })
  }

  const handleReject = () => {
    approveRejectMutation.mutate({
      id,
      action: 'reject',
      reason: rejectReason,
    })
  }

  const handleCancel = () => {
    cancelMutation.mutate({ id })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-charcoal-400 mb-4" />
        <h2 className="text-lg font-semibold text-charcoal-900 mb-2">Request Not Found</h2>
        <p className="text-charcoal-500 mb-4">The leave request you're looking for doesn't exist.</p>
        <Link href="/employee/operations/leave">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leave
          </Button>
        </Link>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
  const leaveTypeConfig = LEAVE_TYPE_CONFIG[request.type as keyof typeof LEAVE_TYPE_CONFIG] ?? LEAVE_TYPE_CONFIG.other
  const StatusIcon = statusConfig?.icon ?? Clock
  const policy = request.policy as { id: string; name: string; leave_type: string } | undefined
  const approver = request.approver as { id: string; full_name: string } | undefined

  // Calculate days
  const startDate = new Date(request.start_date)
  const endDate = new Date(request.end_date)
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const hours = request.hours || days * 8

  // Find balance for this leave type
  const balance = balances?.find(b => {
    const balancePolicy = b.policy as { leave_type: string } | undefined
    return balancePolicy?.leave_type === request.type
  })

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/leave">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{leaveTypeConfig.icon}</span>
                  <div>
                    <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                      {leaveTypeConfig.label} Request
                    </h1>
                    <p className="text-sm text-charcoal-500">
                      {employee?.user?.full_name} • {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className={cn('flex items-center gap-1.5 px-3 py-1.5', statusConfig?.color)}>
                <StatusIcon className="h-4 w-4" />
                {statusConfig?.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Status Banner */}
        <div className={cn('rounded-xl p-4', statusConfig?.bgColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center bg-white/50')}>
                <StatusIcon className={cn('h-5 w-5', statusConfig?.iconColor)} />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">{statusConfig?.label}</p>
                {request.status === 'pending' && (
                  <p className="text-sm text-charcoal-600">Awaiting manager approval</p>
                )}
                {request.status === 'approved' && approver && (
                  <p className="text-sm text-charcoal-600">
                    Approved by {approver.full_name} on {request.approved_at ? new Date(request.approved_at).toLocaleDateString() : 'N/A'}
                  </p>
                )}
                {request.status === 'rejected' && (
                  <p className="text-sm text-charcoal-600">
                    {request.denial_reason || 'No reason provided'}
                  </p>
                )}
              </div>
            </div>

            {request.status === 'pending' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectDialog(true)}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowApproveDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
            {request.status === 'approved' && new Date(request.start_date) > new Date() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="border-charcoal-200"
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading font-semibold">Request Details</CardTitle>
                    <p className="text-sm text-charcoal-500">Time off information</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Leave Type</p>
                    <div className="flex items-center gap-2">
                      <Badge className={leaveTypeConfig.color}>
                        {leaveTypeConfig.icon} {leaveTypeConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Policy</p>
                    <p className="font-medium text-charcoal-900">
                      {policy?.name ?? 'No policy assigned'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Start Date</p>
                    <p className="font-medium text-charcoal-900">
                      {startDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">End Date</p>
                    <p className="font-medium text-charcoal-900">
                      {endDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Duration</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-charcoal-900">{days}</span>
                      <span className="text-charcoal-500">day{days !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Hours</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-charcoal-900">{hours}</span>
                      <span className="text-charcoal-500">hours</span>
                    </div>
                  </div>
                </div>

                {request.reason && (
                  <div className="pt-4 border-t border-charcoal-100">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-2">Reason</p>
                    <p className="text-charcoal-700">{request.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <History className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading font-semibold">Timeline</CardTitle>
                    <p className="text-sm text-charcoal-500">Request activity history</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6">
                  <div className="absolute left-[17px] top-8 bottom-8 w-px bg-charcoal-200" />

                  {/* Created */}
                  <div className="relative flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 z-10">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal-900">Request Submitted</p>
                      <p className="text-sm text-charcoal-500">
                        {employee?.user?.full_name} submitted a {leaveTypeConfig.label.toLowerCase()} request
                      </p>
                      <p className="text-xs text-charcoal-400 mt-1">
                        {request.created_at ? new Date(request.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Approved/Rejected */}
                  {(request.status === 'approved' || request.status === 'rejected') && request.approved_at && (
                    <div className="relative flex gap-4">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                        request.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                      )}>
                        {request.status === 'approved' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900">
                          Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </p>
                        <p className="text-sm text-charcoal-500">
                          {approver?.full_name || 'Manager'} {request.status === 'approved' ? 'approved' : 'rejected'} this request
                        </p>
                        {request.status === 'rejected' && request.denial_reason && (
                          <p className="text-sm text-red-600 mt-1">
                            Reason: {request.denial_reason}
                          </p>
                        )}
                        <p className="text-xs text-charcoal-400 mt-1">
                          {new Date(request.approved_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pending Status */}
                  {request.status === 'pending' && (
                    <div className="relative flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 z-10">
                        <Clock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900">Pending Approval</p>
                        <p className="text-sm text-charcoal-500">
                          Awaiting manager review and approval
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Employee & Balance */}
          <div className="space-y-6">
            {/* Employee Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <CardTitle className="text-lg font-heading font-semibold">Employee</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-charcoal-800 to-charcoal-900 flex items-center justify-center text-white text-lg font-semibold">
                    {employee?.user?.full_name?.charAt(0) ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-900">{employee?.user?.full_name}</p>
                    <p className="text-sm text-charcoal-500">{employee?.job_title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Building2 className="h-3.5 w-3.5 text-charcoal-400" />
                      <span className="text-xs text-charcoal-500">{employee?.department || 'No Department'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leave Balance Card */}
            {balance && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Timer className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <CardTitle className="text-lg font-heading font-semibold">Leave Balance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-600">Available</span>
                    <span className="text-lg font-bold text-green-600">{balance.available_days || 0} days</span>
                  </div>
                  <Progress
                    value={((balance.used_days || 0) / ((balance.entitled_days || 0) + (balance.carried_over_days || 0) + (balance.adjustment_days || 0))) * 100}
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-charcoal-500">Entitled</p>
                      <p className="font-semibold text-charcoal-900">{balance.entitled_days || 0} days</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-charcoal-500">Used</p>
                      <p className="font-semibold text-charcoal-900">{balance.used_days || 0} days</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-charcoal-500">Pending</p>
                      <p className="font-semibold text-amber-600">{balance.pending_days || 0} days</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-charcoal-500">Carried Over</p>
                      <p className="font-semibold text-charcoal-900">{balance.carried_over_days || 0} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Policy Info Card */}
            {policy && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <CardTitle className="text-lg font-heading font-semibold">Policy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-charcoal-900">{policy.name}</p>
                  <p className="text-sm text-charcoal-500 capitalize mt-1">
                    {policy.leave_type?.replace(/_/g, ' ')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this {leaveTypeConfig.label.toLowerCase()} request for {employee?.user?.full_name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-charcoal-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-charcoal-600">Duration</span>
                <span className="font-medium">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-charcoal-600">Dates</span>
                <span className="font-medium">{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveRejectMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveRejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={approveRejectMutation.isPending}
              variant="destructive"
            >
              {approveRejectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this approved leave request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Request
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              variant="destructive"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
