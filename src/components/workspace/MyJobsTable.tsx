'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Briefcase,
  Search,
  ExternalLink,
  Building2,
  Users,
  Plus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  open: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-amber-100 text-amber-800',
  filled: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
}

// Job item from the consolidated query
export interface JobItem {
  id: string
  title: string
  location: string | null
  job_type: string | null
  status: string
  createdAt: string
  account: { id: string; name: string } | null
  submissions_count: number
}

export interface JobsData {
  items: JobItem[]
  total: number
}

interface MyJobsTableProps {
  className?: string
  data?: JobsData
  isLoading?: boolean
}

export function MyJobsTable({ className, data, isLoading = false }: MyJobsTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter jobs client-side based on filter state
  const jobs = useMemo(() => {
    let items = data?.items ?? []

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter((j) =>
        j.title.toLowerCase().includes(searchLower) ||
        j.account?.name.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter((j) => j.status === statusFilter)
    }

    return items
  }, [data?.items, search, statusFilter])

  const total = jobs.length

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            My Jobs
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({total})
              </span>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => router.push('/employee/recruiting/jobs/new')}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Job
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No jobs found</p>
            <p className="text-sm text-charcoal-400">
              {search
                ? 'Try a different search term'
                : 'Create your first job to get started.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="group"
                >
                  <TableCell>
                    <Link
                      href={`/employee/recruiting/jobs/${job.id}`}
                      className="block"
                    >
                      <span className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                        {job.title}
                      </span>
                      <div className="text-sm text-charcoal-500">
                        {job.location || 'Remote'}
                        {job.job_type && ` • ${job.job_type.replace('_', ' ')}`}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {job.account ? (
                      <Link
                        href={`/employee/recruiting/accounts/${job.account.id}`}
                        className="flex items-center gap-1 text-charcoal-600 hover:text-hublot-700"
                      >
                        <Building2 className="w-3 h-3" />
                        {job.account.name}
                      </Link>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        statusColors[job.status] || statusColors.draft
                      )}
                    >
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-charcoal-600">
                      <Users className="w-3 h-3" />
                      {job.submissions_count || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.createdAt ? (
                      <span className="text-charcoal-600">
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/employee/recruiting/jobs/${job.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
