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
import { Loader2, Search, Briefcase, Link2, Check, Building2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface LinkJobToAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  accountName?: string
  onSuccess?: () => void
}

// Status badge styling
const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-success-50', text: 'text-success-700' },
  active: { bg: 'bg-success-50', text: 'text-success-700' },
  draft: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  on_hold: { bg: 'bg-amber-50', text: 'text-amber-700' },
  closed: { bg: 'bg-charcoal-100', text: 'text-charcoal-600' },
  filled: { bg: 'bg-blue-50', text: 'text-blue-700' },
}

export function LinkJobToAccountDialog({
  open,
  onOpenChange,
  accountId,
  accountName,
  onSuccess,
}: LinkJobToAccountDialogProps) {
  const { toast } = useToast()

  // Form state
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null)

  // Search jobs query - find jobs not linked to any account or linked to other accounts
  const { data: searchResults, isLoading: isSearching } = trpc.ats.jobs.list.useQuery(
    { search: searchQuery, limit: 10, includeDrafts: true },
    { enabled: searchQuery.length >= 2 }
  )

  const filteredResults = React.useMemo(() => {
    if (!searchResults?.items) return []
    // Filter out closed/cancelled jobs and jobs already linked to THIS account
    return searchResults.items.filter(j =>
      !['closed', 'cancelled'].includes(j.status || '') &&
      j.company?.id !== accountId
    )
  }, [searchResults, accountId])

  // Link job mutation
  const linkMutation = trpc.ats.jobs.linkToAccount.useMutation({
    onSuccess: () => {
      toast({ title: 'Job linked to account successfully' })
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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedJobId) {
      toast({ title: 'Please select a job', variant: 'error' })
      return
    }

    linkMutation.mutate({
      jobId: selectedJobId,
      accountId,
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
              Link Existing Job
            </DialogTitle>
            <DialogDescription className="text-sm text-charcoal-500 mt-1.5">
              Link an existing job to {accountName ? <span className="font-medium text-charcoal-700">{accountName}</span> : 'this account'}.
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
                <div className="border border-charcoal-200 rounded-md overflow-hidden max-h-[250px] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-charcoal-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching jobs...
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="p-4 text-sm text-charcoal-500 text-center">
                      No jobs found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredResults.map((job) => {
                      const status = STATUS_CONFIG[job.status || 'draft']
                      const hasOtherAccount = job.company && job.company.id !== accountId
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
                            {hasOtherAccount && (
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-600">
                                <Building2 className="h-3 w-3" />
                                Currently linked to: {job.company?.name}
                              </div>
                            )}
                            {!job.company && (
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-charcoal-400">
                                <Building2 className="h-3 w-3" />
                                No account linked
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
                    <p className="text-xs text-charcoal-500">
                      {selectedJob.company ? `Will be moved from: ${selectedJob.company.name}` : 'Currently unassigned'}
                    </p>
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

            {/* Info note */}
            <div className="text-xs text-charcoal-500 bg-charcoal-50 rounded-md p-3">
              <p className="font-medium text-charcoal-600 mb-1">Note:</p>
              <p>Linking a job will associate it with this account. If the job is currently linked to another account, it will be moved.</p>
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
              className="min-w-[100px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
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
