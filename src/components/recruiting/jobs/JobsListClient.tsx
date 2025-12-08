'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// CreateJobDialog has been migrated to a dedicated page:
// /employee/recruiting/jobs/new
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Building2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

type JobStatus = 'draft' | 'open' | 'active' | 'on_hold' | 'filled' | 'cancelled' | 'all'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-200 text-charcoal-700' },
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  on_hold: { label: 'On Hold', color: 'bg-amber-100 text-amber-800' },
  filled: { label: 'Filled', color: 'bg-purple-100 text-purple-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

interface Job {
  id: string
  title: string
  status: string
  location: string | null
  billingRate: number | null
  submissionCount: number
  createdAt: string
  jobType: string | null
  account: { name: string } | null
}

interface JobsListClientProps {
  initialJobs: Job[]
  initialTotal: number
  initialStats: {
    total: number
    active: number
    onHold: number
    filled: number
    urgentJobs: number
  } | null
  initialSearch: string
  initialStatus: string
}

export function JobsListClient({
  initialJobs,
  initialTotal,
  initialStats,
  initialSearch,
  initialStatus,
}: JobsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<JobStatus>((initialStatus as JobStatus) || 'all')

  // Use server data as initial, allow client refetch for mutations
  const jobsQuery = trpc.ats.jobs.list.useQuery(
    {
      search: search || undefined,
      status: statusFilter,
      limit: 50,
      offset: 0,
    },
    {
      initialData: { items: initialJobs, total: initialTotal },
      // Only refetch when filters change from initial
      enabled: search !== initialSearch || statusFilter !== (initialStatus || 'all'),
    }
  )

  const statsQuery = trpc.ats.jobs.getStats.useQuery(
    {},
    {
      initialData: initialStats,
      staleTime: 60 * 1000,
    }
  )

  const jobs = jobsQuery.data?.items || initialJobs
  const stats = statsQuery.data || initialStats

  const handleJobClick = (jobId: string) => {
    router.push(`/employee/recruiting/jobs/${jobId}`)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    // Update URL for server-side filtering on refresh
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  const handleStatusChange = (value: JobStatus) => {
    setStatusFilter(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value !== 'all') {
        params.set('status', value)
      } else {
        params.delete('status')
      }
      router.replace(`?${params.toString()}`)
    })
  }

  return (
    <div className="min-h-screen bg-cream" data-testid="page-content">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-charcoal-900">Jobs</h1>
            <p className="text-charcoal-500 mt-1">
              Manage your job requisitions and pipelines
            </p>
          </div>
          <Button onClick={() => router.push('/employee/recruiting/jobs/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-charcoal-900">
                {stats?.total ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Total Jobs</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {stats?.active ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                {stats?.onHold ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">On Hold</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.filled ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Filled</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {stats?.urgentJobs ?? '-'}
              </div>
              <p className="text-sm text-charcoal-500">Urgent</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No jobs found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first job to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={() => router.push('/employee/recruiting/jobs/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const statusConfig = STATUS_CONFIG[job.status] || STATUS_CONFIG.draft

              return (
                <Card
                  key={job.id}
                  className="bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleJobClick(job.id)}
                  onMouseEnter={() => router.prefetch(`/employee/recruiting/jobs/${job.id}`)}
                  data-testid="job-card"
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-charcoal-900 truncate">
                            {job.title}
                          </h3>
                          <Badge className={cn('text-xs', statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500">
                          {job.account && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.account.name}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </span>
                          )}
                          {job.billingRate && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${job.billingRate}/hr
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.submissionCount} candidates
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium text-charcoal-700">
                          {job.jobType?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-charcoal-500 mt-4">
          Showing {jobs.length} of {jobsQuery.data?.total ?? initialTotal} jobs
        </p>
      </div>
    </div>
  )
}
