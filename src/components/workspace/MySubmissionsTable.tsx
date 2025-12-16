'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
  Send,
  Search,
  ExternalLink,
  Building2,
  User,
  Briefcase,
  Clock,
  Calendar,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  submitted: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-amber-100 text-amber-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interviewing: 'bg-indigo-100 text-indigo-800',
  offered: 'bg-green-100 text-green-800',
  placed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-charcoal-100 text-charcoal-600',
}

// Submission item from the consolidated query
export interface SubmissionItem {
  id: string
  status: string
  submitted_at: string | null
  updated_at: string | null
  candidate: {
    id: string
    first_name: string
    last_name: string
    title: string | null
  } | null
  job: {
    id: string
    title: string
    company: { id: string; name: string } | null
  } | null
}

export interface SubmissionsData {
  items: SubmissionItem[]
  total: number
}

interface MySubmissionsTableProps {
  className?: string
  data?: SubmissionsData
  isLoading?: boolean
}

export function MySubmissionsTable({ className, data, isLoading = false }: MySubmissionsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('active')

  // Filter submissions client-side based on filter state
  const submissions = useMemo(() => {
    let items = data?.items ?? []

    // Apply status filter
    if (statusFilter === 'active') {
      items = items.filter((s) =>
        ['submitted', 'reviewing', 'shortlisted', 'interviewing', 'offered'].includes(s.status)
      )
    } else if (statusFilter !== 'all') {
      items = items.filter((s) => s.status === statusFilter)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter((s) => {
        const candidateName = s.candidate
          ? `${s.candidate.first_name} ${s.candidate.last_name}`.toLowerCase()
          : ''
        const jobTitle = s.job?.title?.toLowerCase() ?? ''
        const accountName = s.job?.company?.name?.toLowerCase() ?? ''
        return (
          candidateName.includes(searchLower) ||
          jobTitle.includes(searchLower) ||
          accountName.includes(searchLower)
        )
      })
    }

    return items
  }, [data?.items, search, statusFilter])

  const total = submissions.length

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            My Submissions
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({total})
              </span>
            )}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search submissions..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No submissions found</p>
            <p className="text-sm text-charcoal-400">
              {search
                ? 'Try a different search term'
                : 'Submit candidates to jobs to track them here.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} className="group">
                  <TableCell>
                    <Link
                      href={`/employee/recruiting/candidates/${submission.candidate?.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-charcoal-400" />
                        <span className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                          {submission.candidate
                            ? `${submission.candidate.first_name} ${submission.candidate.last_name}`
                            : 'Unknown'}
                        </span>
                      </div>
                      {submission.candidate?.title && (
                        <div className="text-sm text-charcoal-500 pl-6">
                          {submission.candidate.title}
                        </div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {submission.job ? (
                      <Link
                        href={`/employee/recruiting/jobs/${submission.job.id}`}
                        className="flex items-center gap-1 text-charcoal-600 hover:text-hublot-700"
                      >
                        <Briefcase className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">
                          {submission.job.title}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.job?.company ? (
                      <Link
                        href={`/employee/recruiting/accounts/${submission.job.company.id}`}
                        className="flex items-center gap-1 text-charcoal-600 hover:text-hublot-700"
                      >
                        <Building2 className="w-3 h-3" />
                        {submission.job.company.name}
                      </Link>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        statusColors[submission.status] || statusColors.draft
                      )}
                    >
                      {submission.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {submission.submitted_at ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(submission.submitted_at), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">Not submitted</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.updated_at ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(submission.updated_at), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/employee/recruiting/jobs/${submission.job?.id}?tab=pipeline`}>
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
