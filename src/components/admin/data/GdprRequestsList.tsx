'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ShieldCheck,
  Plus,
  Search,
  FileText,
  Trash2,
  Check,
  X,
  Loader2,
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import { format, formatDistanceToNow, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

const REQUEST_TYPES = [
  { value: 'dsar', label: 'Data Subject Access Request (DSAR)', description: 'Export all data' },
  { value: 'erasure', label: 'Right to Erasure', description: 'Delete personal data' },
  { value: 'rectification', label: 'Rectification', description: 'Correct inaccurate data' },
  { value: 'restriction', label: 'Restriction', description: 'Limit data processing' },
  { value: 'portability', label: 'Data Portability', description: 'Export in portable format' },
]

export function GdprRequestsList() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [newRequest, setNewRequest] = useState({
    requestType: 'dsar' as string,
    subjectEmail: '',
    subjectName: '',
    subjectPhone: '',
    notes: '',
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  })

  const utils = trpc.useUtils()

  const { data: requests, isLoading } = trpc.data.listGdprRequests.useQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  })

  const { data: requestDetail, isLoading: detailLoading } = trpc.data.getGdprRequest.useQuery(
    { id: selectedRequest || '' },
    { enabled: !!selectedRequest }
  )

  const createMutation = trpc.data.createGdprRequest.useMutation({
    onSuccess: () => {
      utils.data.listGdprRequests.invalidate()
      utils.data.getDashboardStats.invalidate()
      setShowNewRequestDialog(false)
      setNewRequest({
        requestType: 'dsar',
        subjectEmail: '',
        subjectName: '',
        subjectPhone: '',
        notes: '',
        dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      })
    },
  })

  const processMutation = trpc.data.processGdprRequest.useMutation({
    onSuccess: () => {
      utils.data.listGdprRequests.invalidate()
      utils.data.getGdprRequest.invalidate()
      utils.data.getDashboardStats.invalidate()
    },
  })

  const handleCreate = () => {
    if (!newRequest.subjectEmail || !newRequest.requestType) return

    createMutation.mutate({
      requestType: newRequest.requestType as 'dsar' | 'erasure' | 'rectification' | 'restriction' | 'portability',
      subjectEmail: newRequest.subjectEmail,
      subjectName: newRequest.subjectName || undefined,
      subjectPhone: newRequest.subjectPhone || undefined,
      notes: newRequest.notes || undefined,
      dueDate: newRequest.dueDate,
    })
  }

  const handleProcess = (action: 'discover' | 'export' | 'anonymize' | 'complete' | 'reject', notes?: string) => {
    if (!selectedRequest) return

    processMutation.mutate({
      id: selectedRequest,
      action,
      notes,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'in_review':
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const found = REQUEST_TYPES.find(t => t.value === type)
    return found?.label || type
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>GDPR Requests</CardTitle>
              <CardDescription>Manage data subject requests</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowNewRequestDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Requests List */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
            </div>
          ) : requests?.requests && requests.requests.length > 0 ? (
            <div className="space-y-3">
              {requests.requests.map((request) => {
                const daysUntilDue = getDaysUntilDue(request.due_date)
                const isOverdue = daysUntilDue < 0
                const isUrgent = daysUntilDue >= 0 && daysUntilDue <= 7

                return (
                  <div
                    key={request.id}
                    onClick={() => {
                      setSelectedRequest(request.id)
                      setShowDetailDialog(true)
                    }}
                    className="p-4 rounded-lg border border-charcoal-200 hover:border-charcoal-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-charcoal-100">
                          <ShieldCheck className="h-5 w-5 text-charcoal-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-charcoal-900">
                              {request.request_number}
                            </p>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-charcoal-600">
                            {getRequestTypeLabel(request.request_type)}
                          </p>
                          <p className="text-sm text-charcoal-500 mt-1">
                            {request.subject_email}
                            {request.subject_name && ` (${request.subject_name})`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          'flex items-center gap-1 text-sm',
                          isOverdue && 'text-red-600',
                          isUrgent && !isOverdue && 'text-yellow-600',
                          !isOverdue && !isUrgent && 'text-charcoal-500'
                        )}>
                          {isOverdue ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                          <span>
                            {isOverdue
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : `${daysUntilDue} days left`}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-400 mt-1">
                          Due: {format(new Date(request.due_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldCheck className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-charcoal-500">No GDPR requests</p>
              <p className="text-sm text-charcoal-400">
                Create a request when a data subject contacts you
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New GDPR Request</DialogTitle>
            <DialogDescription>
              Record a data subject request for processing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Request Type</Label>
              <Select
                value={newRequest.requestType}
                onValueChange={(value) => setNewRequest(prev => ({ ...prev, requestType: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <p>{type.label}</p>
                        <p className="text-xs text-charcoal-500">{type.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Subject Email *</Label>
              <Input
                className="mt-1"
                type="email"
                value={newRequest.subjectEmail}
                onChange={(e) => setNewRequest(prev => ({ ...prev, subjectEmail: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject Name</Label>
                <Input
                  className="mt-1"
                  value={newRequest.subjectName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, subjectName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  className="mt-1"
                  value={newRequest.subjectPhone}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, subjectPhone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                className="mt-1"
                type="date"
                value={newRequest.dueDate}
                onChange={(e) => setNewRequest(prev => ({ ...prev, dueDate: e.target.value }))}
              />
              <p className="text-xs text-charcoal-500 mt-1">
                GDPR requires response within 30 days
              </p>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                className="mt-1"
                value={newRequest.notes}
                onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details about the request..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newRequest.subjectEmail || createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {requestDetail?.request_number || 'Request Details'}
            </DialogTitle>
            <DialogDescription>
              {requestDetail && getRequestTypeLabel(requestDetail.request_type)}
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-charcoal-400" />
            </div>
          ) : requestDetail ? (
            <div className="space-y-6 py-4">
              {/* Status & Info */}
              <div className="flex items-center justify-between">
                {getStatusBadge(requestDetail.status)}
                <span className="text-sm text-charcoal-500">
                  Created {formatDistanceToNow(new Date(requestDetail.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Subject Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div>
                  <Label className="text-xs text-charcoal-500">Email</Label>
                  <p className="font-medium">{requestDetail.subject_email}</p>
                </div>
                <div>
                  <Label className="text-xs text-charcoal-500">Name</Label>
                  <p className="font-medium">{requestDetail.subject_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-charcoal-500">Phone</Label>
                  <p className="font-medium">{requestDetail.subject_phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-charcoal-500">Due Date</Label>
                  <p className="font-medium">{format(new Date(requestDetail.due_date), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {/* Data Found */}
              {requestDetail.data_found && Object.keys(requestDetail.data_found).length > 0 && (
                <div>
                  <Label className="mb-2 block">Data Found</Label>
                  <div className="border rounded-lg divide-y">
                    {Object.entries(requestDetail.data_found as Record<string, number>).map(([table, count]) => (
                      <div key={table} className="flex justify-between p-3">
                        <span className="text-charcoal-600">{table}</span>
                        <Badge variant="outline">{count} records</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {requestDetail.notes && (
                <div>
                  <Label className="mb-2 block">Notes</Label>
                  <p className="text-charcoal-600">{requestDetail.notes}</p>
                </div>
              )}

              {/* Actions */}
              {requestDetail.status !== 'completed' && requestDetail.status !== 'rejected' && (
                <div className="border-t pt-4">
                  <Label className="mb-3 block">Actions</Label>
                  <div className="flex flex-wrap gap-2">
                    {requestDetail.status === 'pending' && (
                      <Button
                        variant="outline"
                        onClick={() => handleProcess('discover')}
                        disabled={processMutation.isPending}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Discover Data
                      </Button>
                    )}
                    {requestDetail.status === 'in_review' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleProcess('export')}
                          disabled={processMutation.isPending}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Export
                        </Button>
                        {requestDetail.request_type === 'erasure' && (
                          <Button
                            variant="outline"
                            onClick={() => handleProcess('anonymize')}
                            disabled={processMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Anonymize Data
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      onClick={() => handleProcess('complete', 'Request fulfilled')}
                      disabled={processMutation.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleProcess('reject', 'Request could not be fulfilled')}
                      disabled={processMutation.isPending}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
