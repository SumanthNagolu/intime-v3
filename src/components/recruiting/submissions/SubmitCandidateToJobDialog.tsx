'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ResumePickerField } from './ResumePickerField'

interface SubmitCandidateToJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: string
  candidateName: string
  onSuccess?: () => void
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  sourcing: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-amber-100 text-amber-800',
  new: 'bg-purple-100 text-purple-800',
  working: 'bg-blue-100 text-blue-800',
  draft: 'bg-charcoal-100 text-charcoal-600',
}

export function SubmitCandidateToJobDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  onSuccess,
}: SubmitCandidateToJobDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState('')

  // Fetch available jobs
  const { data: jobsData, isLoading: isLoadingJobs } = trpc.ats.jobs.list.useQuery(
    {
      status: 'open',
      search: searchQuery || undefined,
      limit: 50,
    },
    { enabled: open }
  )

  const jobs = jobsData?.items || []
  const selectedJob = jobs.find((j) => j.id === selectedJobId)

  const utils = trpc.useUtils()

  // Submit mutation
  const submitMutation = trpc.ats.submissions.create.useMutation({
    onSuccess: (result) => {
      toast.success(`${candidateName} submitted to ${result.job.title}`)
      utils.ats.submissions.list.invalidate()
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit candidate')
    },
  })

  const resetForm = () => {
    setSelectedJobId(null)
    setSelectedResumeId(null)
    setSubmissionNotes('')
    setSearchQuery('')
  }

  const handleSubmit = () => {
    if (!selectedJobId) {
      toast.error('Please select a job')
      return
    }

    submitMutation.mutate({
      jobId: selectedJobId,
      candidateId,
      status: 'sourced',
      submissionNotes: submissionNotes || undefined,
      clientResumeFileId: selectedResumeId || undefined,
    })
  }

  const isSubmitting = submitMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit {candidateName} to Job</DialogTitle>
          <DialogDescription>
            Select a job and optionally choose which resume version to submit.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Jobs List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card
                key={job.id}
                className={cn(
                  'cursor-pointer transition-all hover:border-hublot-500',
                  selectedJobId === job.id ? 'border-hublot-500 bg-hublot-50' : ''
                )}
                onClick={() => setSelectedJobId(job.id)}
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
                            {(job.company as { name?: string })?.name}
                          </span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                        )}
                        {job.bill_rate_max && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${job.bill_rate_max}/hr
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
              <p>No open jobs found</p>
            </div>
          )}
        </div>

        {/* Submission Details (shown when job is selected) */}
        {selectedJobId && (
          <div className="space-y-4 pt-4 border-t">
            {/* Resume Picker */}
            <ResumePickerField
              candidateId={candidateId}
              value={selectedResumeId}
              onChange={setSelectedResumeId}
              label="Select Resume"
            />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Submission Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this submission..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedJobId || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit to Job'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SubmitCandidateToJobDialog
