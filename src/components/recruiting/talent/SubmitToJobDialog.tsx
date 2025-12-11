'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Briefcase, Building2, MapPin, DollarSign, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SubmitToJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultantId: string
  talentName: string
  targetRate?: number
  onSuccess?: () => void
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  sourcing: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-amber-100 text-amber-800',
  new: 'bg-purple-100 text-purple-800',
  working: 'bg-blue-100 text-blue-800',
}

export function SubmitToJobDialog({
  open,
  onOpenChange,
  consultantId,
  talentName,
  targetRate,
  onSuccess,
}: SubmitToJobDialogProps) {
  const [activeTab, setActiveTab] = useState<'client-jobs' | 'job-orders'>('client-jobs')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [selectedJobType, setSelectedJobType] = useState<'client' | 'order' | null>(null)
  const [proposedRate, setProposedRate] = useState(targetRate?.toString() || '')
  const [notes, setNotes] = useState('')

  // Fetch client jobs
  const { data: clientJobs, isLoading: isLoadingJobs } = trpc.bench.submissions.getAvailableJobs.useQuery({
    search: searchQuery || undefined,
    limit: 20,
  })

  // Fetch job orders
  const { data: jobOrdersData, isLoading: isLoadingOrders } = trpc.bench.jobOrders.list.useQuery({
    search: searchQuery || undefined,
    status: 'working',
    limit: 20,
  })

  const jobOrders = jobOrdersData?.items || []

  const utils = trpc.useUtils()

  // Submit to client job mutation
  const submitToClientJobMutation = trpc.bench.submissions.submitToClientJob.useMutation({
    onSuccess: () => {
      toast.success(`${talentName} submitted to client job`)
      utils.bench.talent.getById.invalidate({ id: consultantId })
      utils.bench.submissions.listByConsultant.invalidate({ consultantId })
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit talent')
    },
  })

  // Submit to job order mutation
  const submitToJobOrderMutation = trpc.bench.submissions.submitToJobOrder.useMutation({
    onSuccess: () => {
      toast.success(`${talentName} submitted to job order`)
      utils.bench.talent.getById.invalidate({ id: consultantId })
      utils.bench.submissions.listByConsultant.invalidate({ consultantId })
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit talent')
    },
  })

  const resetForm = () => {
    setSelectedJob(null)
    setSelectedJobType(null)
    setProposedRate(targetRate?.toString() || '')
    setNotes('')
    setSearchQuery('')
  }

  const handleSubmit = () => {
    if (!selectedJob || !selectedJobType) {
      toast.error('Please select a job')
      return
    }

    const rate = proposedRate ? parseFloat(proposedRate) : undefined

    if (selectedJobType === 'client') {
      submitToClientJobMutation.mutate({
        jobId: selectedJob,
        consultantId,
        submittedRate: rate,
        notes: notes || undefined,
      })
    } else {
      submitToJobOrderMutation.mutate({
        jobOrderId: selectedJob,
        consultantId,
        submittedRate: rate,
        notes: notes || undefined,
      })
    }
  }

  const isSubmitting = submitToClientJobMutation.isPending || submitToJobOrderMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit {talentName} to Job</DialogTitle>
          <DialogDescription>
            Select a client job or vendor job order to submit this talent to.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'client-jobs' | 'job-orders')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="client-jobs">Client Jobs</TabsTrigger>
            <TabsTrigger value="job-orders">Vendor Job Orders</TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Client Jobs Tab */}
          <TabsContent value="client-jobs" className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
              </div>
            ) : clientJobs && clientJobs.length > 0 ? (
              clientJobs.map((job) => (
                <Card
                  key={job.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-hublot-500',
                    selectedJob === job.id && selectedJobType === 'client'
                      ? 'border-hublot-500 bg-hublot-50'
                      : ''
                  )}
                  onClick={() => {
                    setSelectedJob(job.id)
                    setSelectedJobType('client')
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-charcoal-400" />
                          <span className="font-medium text-charcoal-900">{job.title}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-500">
                          {job.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {Array.isArray(job.company) ? job.company[0]?.name : (job.company as { name?: string })?.name}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          {job.bill_rate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${job.bill_rate}/hr
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={statusColors[job.status] || 'bg-charcoal-100'}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-charcoal-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
                <p>No open client jobs found</p>
              </div>
            )}
          </TabsContent>

          {/* Job Orders Tab */}
          <TabsContent value="job-orders" className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
              </div>
            ) : jobOrders.length > 0 ? (
              jobOrders.map((order) => (
                <Card
                  key={order.id}
                  className={cn(
                    'cursor-pointer transition-all hover:border-hublot-500',
                    selectedJob === order.id && selectedJobType === 'order'
                      ? 'border-hublot-500 bg-hublot-50'
                      : ''
                  )}
                  onClick={() => {
                    setSelectedJob(order.id)
                    setSelectedJobType('order')
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-charcoal-400" />
                          <span className="font-medium text-charcoal-900">{order.title}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-500">
                          {order.vendor && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {(order.vendor as { name?: string })?.name}
                            </span>
                          )}
                          {order.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.location}
                            </span>
                          )}
                          {order.bill_rate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${order.bill_rate}/hr
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={statusColors[order.status] || 'bg-charcoal-100'}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-charcoal-500">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
                <p>No active job orders found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Submission Details */}
        {selectedJob && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate">Proposed Rate ($/hr)</Label>
                <Input
                  id="rate"
                  type="number"
                  placeholder="Enter rate"
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes for this submission..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedJob || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Talent'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
