'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { UpdateStatusDialog, CloseJobWizard } from '@/components/recruiting/jobs'
import { SubmissionPipeline } from '@/components/recruiting/submissions'
import {
  MapPin,
  DollarSign,
  Users,
  Clock,
  Building2,
  Briefcase,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

type JobStatus = 'draft' | 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled'

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-200 text-charcoal-700' },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-800' },
  filled: { label: 'Filled', color: 'bg-purple-100 text-purple-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

// Custom event handler types
declare global {
  interface WindowEventMap {
    'openJobDialog': CustomEvent<{ dialogId: string }>
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [activeTab, setActiveTab] = useState('overview')
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showCloseWizard, setShowCloseWizard] = useState(false)

  // Queries
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const historyQuery = trpc.ats.jobs.getStatusHistory.useQuery({ jobId })
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId, limit: 100 })

  const job = jobQuery.data
  const history = historyQuery.data || []
  const submissions = submissionsQuery.data?.items || []

  // Listen for quick action dialog events from the sidebar
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      switch (event.detail.dialogId) {
        case 'updateStatus':
          setShowStatusDialog(true)
          break
        case 'closeJob':
          setShowCloseWizard(true)
          break
      }
    }

    window.addEventListener('openJobDialog', handleOpenDialog)
    return () => window.removeEventListener('openJobDialog', handleOpenDialog)
  }, [])

  // Loading state - show skeleton since layout handles main loading
  if (jobQuery.isLoading || !job) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Calculate days open
  const createdDate = new Date(job.created_at)
  const daysOpen = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container mx-auto px-6 py-6">
      {/* Job Quick Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500 mb-6 bg-white p-4 rounded-lg">
        {job.account && (
          <span className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {(job.account as { name: string }).name}
          </span>
        )}
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
            {job.is_remote && ' (Remote)'}
            {job.hybrid_days && ` (Hybrid ${job.hybrid_days}d/wk)`}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Briefcase className="w-4 h-4" />
          {job.job_type?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-charcoal-400" />
              <span className="text-sm text-charcoal-500">Positions</span>
            </div>
            <div className="text-2xl font-bold text-charcoal-900 mt-1">
              {job.positions_filled || 0}/{job.positions_count || 1}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-charcoal-400" />
              <span className="text-sm text-charcoal-500">Rate Range</span>
            </div>
            <div className="text-2xl font-bold text-charcoal-900 mt-1">
              {job.rate_min && job.rate_max
                ? `$${job.rate_min}-${job.rate_max}`
                : job.rate_min
                ? `$${job.rate_min}+`
                : 'TBD'}
              <span className="text-sm font-normal">/{job.rate_type || 'hr'}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-charcoal-400" />
              <span className="text-sm text-charcoal-500">Submissions</span>
            </div>
            <div className="text-2xl font-bold text-charcoal-900 mt-1">
              {submissions.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-charcoal-400" />
              <span className="text-sm text-charcoal-500">Days Open</span>
            </div>
            <div className="text-2xl font-bold text-charcoal-900 mt-1">{daysOpen}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {job.description ? (
                    <div className="prose prose-sm max-w-none text-charcoal-700">
                      {job.description}
                    </div>
                  ) : (
                    <p className="text-charcoal-500 italic">No description provided</p>
                  )}
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.required_skills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      )) || <span className="text-charcoal-500 italic">None specified</span>}
                    </div>
                  </div>
                  {job.nice_to_have_skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                        Nice to Have
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.nice_to_have_skills.map((skill: string) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(job.min_experience_years || job.max_experience_years) && (
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-700 mb-1">Experience</h4>
                      <p className="text-charcoal-600">
                        {job.min_experience_years || 0} - {job.max_experience_years || '10+'} years
                      </p>
                    </div>
                  )}
                  {job.visa_requirements?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-charcoal-700 mb-1">
                        Visa Requirements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.visa_requirements.map((visa: string) => (
                          <Badge key={visa} variant="outline">
                            {visa.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Details */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.target_fill_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Target Fill Date</span>
                      <span className="text-sm font-medium">
                        {format(new Date(job.target_fill_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {job.target_start_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Target Start Date</span>
                      <span className="text-sm font-medium">
                        {format(new Date(job.target_start_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-500">Priority</span>
                    <Badge variant="outline">{job.priority || 'Normal'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-500">Created</span>
                    <span className="text-sm font-medium">
                      {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {job.published_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Published</span>
                      <span className="text-sm font-medium">
                        {format(new Date(job.published_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status History */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyQuery.isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : history.length === 0 ? (
                    <p className="text-sm text-charcoal-500">No status changes yet</p>
                  ) : (
                    <div className="space-y-3">
                      {history.slice(0, 5).map((entry) => {
                        const newStatusConfig = STATUS_CONFIG[entry.new_status as JobStatus]
                        return (
                          <div key={entry.id} className="flex items-start gap-3">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full mt-2',
                                newStatusConfig?.color.replace('text-', 'bg-').split(' ')[0] ||
                                  'bg-charcoal-300'
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-charcoal-900">
                                {entry.previous_status ? (
                                  <>
                                    {entry.previous_status} → {entry.new_status}
                                  </>
                                ) : (
                                  <>Created as {entry.new_status}</>
                                )}
                              </p>
                              {entry.reason && (
                                <p className="text-xs text-charcoal-500 truncate">
                                  {entry.reason}
                                </p>
                              )}
                              <p className="text-xs text-charcoal-400">
                                {formatDistanceToNow(new Date(entry.changed_at), {
                                  addSuffix: true,
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionPipeline
                submissions={submissions as Array<{
                  id: string
                  status: string
                  created_at: string
                  submitted_at?: string
                  candidate?: { id: string; first_name: string; last_name: string; email?: string; phone?: string }
                  job?: { id: string; title: string; account?: { id: string; name: string } | null; rate_min?: number; rate_max?: number }
                  ai_match_score?: number
                  recruiter_match_score?: number
                  submitted_rate?: number
                }>}
                job={{
                  id: jobId,
                  title: job.title,
                  account: job.account as { id: string; name: string } | null,
                  rate_min: job.rate_min,
                  rate_max: job.rate_max,
                }}
                onCandidateClick={(submissionId) => {
                  router.push(`/employee/recruiting/submissions/${submissionId}`)
                }}
                onAddCandidate={() => {
                  router.push(`/employee/recruiting/jobs/${jobId}/add-candidate`)
                }}
                onRefresh={() => {
                  submissionsQuery.refetch()
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="w-8 h-8 rounded-full bg-hublot-100 flex items-center justify-center">
                      <History className="w-4 h-4 text-hublot-900" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-charcoal-900">
                        Status changed to {entry.new_status}
                      </p>
                      {entry.reason && (
                        <p className="text-sm text-charcoal-600 mt-1">{entry.reason}</p>
                      )}
                      {entry.notes && (
                        <p className="text-sm text-charcoal-500 mt-1">{entry.notes}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-400">
                        <span>
                          {format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}
                        </span>
                        {entry.changed_by_user && (
                          <>
                            <span>by</span>
                            <span>
                              {Array.isArray(entry.changed_by_user)
                                ? entry.changed_by_user[0]?.full_name
                                : (entry.changed_by_user as { full_name: string }).full_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-center text-charcoal-500 py-8">No activity recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Status Dialog */}
      <UpdateStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        jobId={jobId}
        currentStatus={job.status}
        jobTitle={job.title}
        positionsFilled={job.positions_filled || 0}
        positionsCount={job.positions_count || 1}
        onSuccess={() => {
          jobQuery.refetch()
          historyQuery.refetch()
        }}
      />

      {/* Close Job Wizard */}
      <CloseJobWizard
        open={showCloseWizard}
        onOpenChange={setShowCloseWizard}
        jobId={jobId}
        jobTitle={job.title}
        currentStatus={job.status}
        positionsFilled={job.positions_filled || 0}
        positionsCount={job.positions_count || 1}
        activeSubmissionsCount={submissions.filter(
          (s) => !['placed', 'rejected', 'withdrawn'].includes(s.status)
        ).length}
        onSuccess={() => {
          jobQuery.refetch()
          historyQuery.refetch()
          submissionsQuery.refetch()
        }}
      />
    </div>
  )
}
