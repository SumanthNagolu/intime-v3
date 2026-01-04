'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Briefcase, Link2, Check, Building2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import type { JobContactRole } from '@/types/workspace'

interface LinkJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  onSuccess?: () => void
}

// Role options matching the database enum
const ROLE_OPTIONS: { value: JobContactRole; label: string; description: string }[] = [
  { value: 'hiring_manager', label: 'Hiring Manager', description: 'Primary decision maker for the role' },
  { value: 'hr_contact', label: 'HR Contact', description: 'Human resources representative' },
  { value: 'technical_interviewer', label: 'Technical Interviewer', description: 'Conducts technical interviews' },
  { value: 'decision_maker', label: 'Decision Maker', description: 'Has authority to approve hire' },
  { value: 'recruiter_poc', label: 'Recruiter POC', description: 'Main point of contact for recruiter' },
  { value: 'end_client_contact', label: 'End Client Contact', description: 'Representative from end client' },
]

// Status badge styling
const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-success-50', text: 'text-success-700' },
  active: { bg: 'bg-success-50', text: 'text-success-700' },
  draft: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  on_hold: { bg: 'bg-amber-50', text: 'text-amber-700' },
  closed: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  filled: { bg: 'bg-blue-50', text: 'text-blue-700' },
}

export function LinkJobDialog({
  open,
  onOpenChange,
  contactId,
  onSuccess,
}: LinkJobDialogProps) {
  const { toast } = useToast()

  // Form state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null)
  const [role, setRole] = React.useState<JobContactRole>('hiring_manager')
  const [isPrimary, setIsPrimary] = React.useState(true)
  const [notes, setNotes] = React.useState('')

  // Search jobs query (include drafts so we can link to jobs in progress)
  const { data: searchResults, isLoading: isSearching } = trpc.ats.jobs.list.useQuery(
    { search: searchQuery, limit: 10, includeDrafts: true },
    { enabled: searchQuery.length >= 2 }
  )

  const filteredResults = React.useMemo(() => {
    if (!searchResults?.items) return []
    // Filter out closed/cancelled jobs for better UX (show only active jobs)
    return searchResults.items.filter(j =>
      !['closed', 'cancelled'].includes(j.status || '')
    )
  }, [searchResults])

  // Link job mutation
  const linkMutation = trpc.jobContacts.link.useMutation({
    onSuccess: () => {
      toast({ title: 'Job linked to contact successfully' })
      onSuccess?.()
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const resetForm = () => {
    setSearchQuery('')
    setSelectedJobId(null)
    setRole('hiring_manager')
    setIsPrimary(true)
    setNotes('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedJobId) {
      toast({ title: 'Please select a job', variant: 'error' })
      return
    }

    linkMutation.mutate({
      jobId: selectedJobId,
      contactId,
      role,
      isPrimary,
      notes: notes.trim() || undefined,
    })
  }

  const selectedJob = filteredResults.find(j => j.id === selectedJobId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-charcoal-100">
            <DialogTitle className="text-xl font-heading flex items-center gap-2">
              <Link2 className="h-5 w-5 text-emerald-600" />
              Link to Job
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Associate this contact with a job and define their role.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-6 space-y-5">
            {/* Job Search */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Search Job <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search by job title..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedJobId(null)
                  }}
                  className="pl-9 h-10"
                />
              </div>

              {/* Search Results */}
              {searchQuery.length >= 2 && (
                <div className="border border-charcoal-200 rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-charcoal-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching jobs...
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="p-4 text-sm text-charcoal-500 text-center">
                      No active jobs found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredResults.map((job) => {
                      const status = STATUS_CONFIG[job.status || 'draft']
                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className={cn(
                            'w-full px-4 py-3 text-left hover:bg-charcoal-50 transition-colors flex items-start gap-3 border-b border-charcoal-100 last:border-0',
                            selectedJobId === job.id && 'bg-emerald-50'
                          )}
                        >
                          <div className={cn(
                            'h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0',
                            selectedJobId === job.id ? 'bg-emerald-500 text-white' : 'bg-charcoal-100 text-charcoal-600'
                          )}>
                            {selectedJobId === job.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Briefcase className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-charcoal-900 truncate">
                                {job.title}
                              </span>
                              <span className={cn(
                                'text-xs px-1.5 py-0.5 rounded',
                                status?.bg || 'bg-charcoal-100',
                                status?.text || 'text-charcoal-600'
                              )}>
                                {job.status}
                              </span>
                            </div>
                            {job.company && (
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-charcoal-500">
                                <Building2 className="h-3 w-3" />
                                {job.company.name}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              )}

              {/* Selected Job Display */}
              {selectedJob && searchQuery.length < 2 && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-md p-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-900">{selectedJob.title}</p>
                    {selectedJob.company && (
                      <p className="text-xs text-charcoal-500">{selectedJob.company.name}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedJobId(null)}
                    className="text-charcoal-400 hover:text-charcoal-600"
                  >
                    Change
                  </Button>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={(v) => setRole(v as JobContactRole)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-charcoal-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Is Primary Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="isPrimary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="isPrimary" className="text-sm font-medium cursor-pointer">
                  Primary contact for this role
                </Label>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Mark as the main contact for this role on the job
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this relationship..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-50/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedJobId || linkMutation.isPending}
              className="min-w-[100px]"
            >
              {linkMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Link Job
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
