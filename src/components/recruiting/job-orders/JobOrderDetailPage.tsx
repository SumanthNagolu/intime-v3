'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SubmitTalentDialog } from './SubmitTalentDialog'
import {
  ArrowLeft,
  Briefcase,
  Edit2,
  MoreHorizontal,
  Trash2,
  Plus,
  Loader2,
  ExternalLink,
  Save,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Users,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'

interface JobOrderDetailPageProps {
  jobOrderId: string
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  working: 'bg-amber-100 text-amber-800',
  filled: 'bg-green-100 text-green-800',
  closed: 'bg-charcoal-100 text-charcoal-600',
  on_hold: 'bg-red-100 text-red-800',
}

const priorityColors: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

const submissionStatusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview_requested: 'bg-amber-100 text-amber-800',
  interviewing: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
  offered: 'bg-teal-100 text-teal-800',
  accepted: 'bg-green-100 text-green-800',
  placed: 'bg-emerald-100 text-emerald-800',
}

export function JobOrderDetailPage({ jobOrderId }: JobOrderDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [editMode, setEditMode] = useState(false)
  const [submitTalentOpen, setSubmitTalentOpen] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editWorkMode, setEditWorkMode] = useState('')
  const [editBillRate, setEditBillRate] = useState('')
  const [editPositions, setEditPositions] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [editPriority, setEditPriority] = useState('')

  // Fetch job order data
  const jobOrderQuery = trpc.bench.jobOrders.getById.useQuery({ id: jobOrderId })

  // Fetch submissions
  const submissionsQuery = trpc.bench.submissions.listByJobOrder.useQuery({ jobOrderId })

  // Mutations
  const updateMutation = trpc.bench.jobOrders.update.useMutation({
    onSuccess: () => {
      toast.success('Job order updated successfully')
      utils.bench.jobOrders.getById.invalidate({ id: jobOrderId })
      setEditMode(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update job order')
    },
  })

  const deleteMutation = trpc.bench.jobOrders.delete.useMutation({
    onSuccess: () => {
      toast.success('Job order deleted successfully')
      router.push('/employee/recruiting/job-orders')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete job order')
    },
  })

  const updateSubmissionMutation = trpc.bench.submissions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Submission status updated')
      utils.bench.submissions.listByJobOrder.invalidate({ jobOrderId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update submission')
    },
  })

  const jobOrder = jobOrderQuery.data
  const submissions = submissionsQuery.data || []
  const vendor = jobOrder?.vendor as { id: string; name: string; type: string } | null

  // Initialize edit form
  const startEdit = () => {
    if (jobOrder) {
      setEditTitle(jobOrder.title)
      setEditDescription(jobOrder.description || '')
      setEditLocation(jobOrder.location || '')
      setEditWorkMode(jobOrder.work_mode || '')
      setEditBillRate(jobOrder.bill_rate?.toString() || '')
      setEditPositions(jobOrder.positions?.toString() || '1')
      setEditStatus(jobOrder.status)
      setEditPriority(jobOrder.priority)
    }
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
  }

  const saveEdit = () => {
    updateMutation.mutate({
      id: jobOrderId,
      title: editTitle,
      description: editDescription || undefined,
      location: editLocation || undefined,
      workMode: editWorkMode as 'onsite' | 'remote' | 'hybrid' | undefined,
      billRate: editBillRate ? parseFloat(editBillRate) : undefined,
      positions: parseInt(editPositions) || 1,
      status: editStatus as 'new' | 'working' | 'filled' | 'closed' | 'on_hold',
      priority: editPriority as 'low' | 'medium' | 'high' | 'urgent',
    })
  }

  const handleUpdateSubmissionStatus = (submissionId: string, status: string) => {
    updateSubmissionMutation.mutate({
      submissionId,
      status: status as 'submitted' | 'shortlisted' | 'interview_requested' | 'interviewing' | 'rejected' | 'offered' | 'accepted' | 'placed',
    })
  }

  if (jobOrderQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!jobOrder) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900">Job order not found</h3>
          <p className="text-charcoal-500 mb-4">The job order you are looking for does not exist.</p>
          <Link href="/employee/recruiting/job-orders">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Orders
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employee/recruiting/job-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-heading font-semibold text-charcoal-900">{jobOrder.title}</h1>
              <Badge className={cn(statusColors[jobOrder.status])}>{jobOrder.status.replace('_', ' ')}</Badge>
              <Badge className={cn(priorityColors[jobOrder.priority])}>{jobOrder.priority}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-charcoal-500 mt-1">
              {vendor && (
                <Link href={`/employee/recruiting/vendors/${vendor.id}`} className="flex items-center gap-1 hover:text-hublot-700">
                  <Building2 className="w-3 h-3" />
                  {vendor.name}
                </Link>
              )}
              {jobOrder.client_name && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {jobOrder.client_name}
                </span>
              )}
              {jobOrder.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {jobOrder.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={cancelEdit} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setSubmitTalentOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Submit Talent
              </Button>
              <Button variant="outline" onClick={startEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUpdateSubmissionStatus(jobOrderId, 'filled')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Filled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateSubmissionStatus(jobOrderId, 'closed')}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark as Closed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => deleteMutation.mutate({ id: jobOrderId })}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Job Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {editMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Job Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-work-mode">Work Mode</Label>
                    <Select value={editWorkMode} onValueChange={setEditWorkMode}>
                      <SelectTrigger id="edit-work-mode">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-bill-rate">Bill Rate ($/hr)</Label>
                    <Input
                      id="edit-bill-rate"
                      type="number"
                      step="0.01"
                      value={editBillRate}
                      onChange={(e) => setEditBillRate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-positions">Positions</Label>
                    <Input
                      id="edit-positions"
                      type="number"
                      min="1"
                      value={editPositions}
                      onChange={(e) => setEditPositions(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger id="edit-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="working">Working</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select value={editPriority} onValueChange={setEditPriority}>
                      <SelectTrigger id="edit-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal-500">Bill Rate</p>
                        <p className="text-xl font-bold text-charcoal-900">
                          {jobOrder.bill_rate ? `$${jobOrder.bill_rate}` : '-'}
                        </p>
                        <p className="text-xs text-charcoal-500">{jobOrder.rate_type || 'hourly'}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-charcoal-300" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal-500">Positions</p>
                        <p className="text-xl font-bold text-charcoal-900">{jobOrder.positions || 1}</p>
                      </div>
                      <Users className="w-8 h-8 text-charcoal-300" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal-500">Submissions</p>
                        <p className="text-xl font-bold text-charcoal-900">{submissions.length}</p>
                      </div>
                      <Send className="w-8 h-8 text-charcoal-300" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-charcoal-500">Received</p>
                        <p className="text-sm font-medium text-charcoal-900">
                          {formatDistanceToNow(new Date(jobOrder.received_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-charcoal-300" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobOrder.description ? (
                    <p className="text-charcoal-700 whitespace-pre-wrap">{jobOrder.description}</p>
                  ) : (
                    <p className="text-charcoal-400">No description provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-charcoal-500">Work Mode</Label>
                      <p className="text-charcoal-900 capitalize">{jobOrder.work_mode || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-charcoal-500">Duration</Label>
                      <p className="text-charcoal-900">
                        {jobOrder.duration_months ? `${jobOrder.duration_months} months` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-charcoal-500">Source</Label>
                      <p className="text-charcoal-900 capitalize">{jobOrder.source || 'Unknown'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-charcoal-500">Received</Label>
                      <p className="text-charcoal-900">
                        {format(new Date(jobOrder.received_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {jobOrder.response_due_at && (
                      <div>
                        <Label className="text-charcoal-500">Response Due</Label>
                        <p className="text-charcoal-900">
                          {format(new Date(jobOrder.response_due_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-charcoal-500">Created</Label>
                      <p className="text-charcoal-900">
                        {format(new Date(jobOrder.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>Talent submitted to this job order</CardDescription>
              </div>
              <Button onClick={() => setSubmitTalentOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Submit Talent
              </Button>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Talent</TableHead>
                      <TableHead>Submitted Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => {
                      const consultant = submission.consultant as {
                        id: string
                        candidate: { id: string; full_name: string; email?: string; avatar_url?: string }
                      } | null
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <Link href={`/employee/recruiting/talent/${consultant?.id}`} className="font-medium text-charcoal-900 hover:text-hublot-700">
                              {consultant?.candidate?.full_name || 'Unknown'}
                            </Link>
                            {consultant?.candidate?.email && (
                              <div className="text-xs text-charcoal-500">{consultant.candidate.email}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.submitted_rate ? `$${submission.submitted_rate}/hr` : '-'}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={submission.status}
                              onValueChange={(value) => handleUpdateSubmissionStatus(submission.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <Badge className={cn(submissionStatusColors[submission.status] || 'bg-charcoal-100')}>
                                  {submission.status.replace('_', ' ')}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                <SelectItem value="interview_requested">Interview Requested</SelectItem>
                                <SelectItem value="interviewing">Interviewing</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="offered">Offered</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="placed">Placed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-charcoal-500">
                            {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-charcoal-500">
                            {submission.client_response_at
                              ? formatDistanceToNow(new Date(submission.client_response_at), { addSuffix: true })
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <Link href={`/employee/recruiting/talent/${consultant?.id}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Send className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-charcoal-900">No submissions yet</h3>
                  <p className="text-charcoal-500 mb-4">Submit talent to this job order</p>
                  <Button onClick={() => setSubmitTalentOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Talent
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>Skills and requirements for this position</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-charcoal-500">Requirements tracking will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit Talent Dialog */}
      <SubmitTalentDialog
        open={submitTalentOpen}
        onOpenChange={setSubmitTalentOpen}
        jobOrderId={jobOrderId}
        jobOrderTitle={jobOrder.title}
      />
    </div>
  )
}
