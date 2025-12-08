'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Plus, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AccountJobsSectionProps {
  accountId: string
  onNewJob: () => void
}

/**
 * Jobs Section - Isolated component with self-contained query
 * Trigger: Rendered when section === 'jobs'
 * DB Call: jobs.list({ accountId, limit: 50 })
 */
export function AccountJobsSection({ accountId, onNewJob }: AccountJobsSectionProps) {
  // This query fires when this component is rendered
  const jobsQuery = trpc.ats.jobs.list.useQuery({ accountId, limit: 50 })
  const jobs = jobsQuery.data?.items || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Job Requisitions</CardTitle>
          <CardDescription>All job orders for this account</CardDescription>
        </div>
        <Button onClick={onNewJob}>
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </CardHeader>
      <CardContent>
        {jobsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No jobs yet</p>
            <Button className="mt-4" onClick={onNewJob}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Job
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <Link
                key={job.id}
                href={`/employee/recruiting/jobs/${job.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-hublot-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-hublot-700" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">{job.title}</p>
                    <div className="flex items-center gap-2 text-sm text-charcoal-500">
                      <span className="capitalize">{job.jobType?.replace('_', ' ')}</span>
                      {job.location && (
                        <>
                          <span>&bull;</span>
                          <span>{job.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={job.status === 'active' ? 'default' : job.status === 'filled' ? 'outline' : 'secondary'}>
                    {job.status}
                  </Badge>
                  <span className="text-sm text-charcoal-400">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

