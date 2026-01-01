'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
import {
  Briefcase,
  Search,
  Building2,
  User,
  Users,
  Calendar,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { TeamWorkspaceJob, TeamMember } from '@/types/workspace'

const statusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  open: 'bg-green-100 text-green-800',
  on_hold: 'bg-amber-100 text-amber-800',
  filled: 'bg-blue-100 text-blue-800',
  closed: 'bg-charcoal-100 text-charcoal-600',
  canceled: 'bg-red-100 text-red-800',
}

interface TeamJobsTableProps {
  jobs: TeamWorkspaceJob[]
  members: TeamMember[]
  initialMemberId?: string
  initialFilter?: string
}

export function TeamJobsTable({
  jobs,
  members,
  initialMemberId,
  initialFilter,
}: TeamJobsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter || 'open')
  const [memberFilter, setMemberFilter] = useState<string>(initialMemberId || 'all')

  // Filter jobs client-side
  const filteredJobs = useMemo(() => {
    let items = [...jobs]

    // Apply member filter
    if (memberFilter !== 'all') {
      items = items.filter((j) => j.owner?.id === memberFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      items = items.filter((j) => j.status === statusFilter)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      items = items.filter((j) => {
        const jobTitle = j.title?.toLowerCase() ?? ''
        const accountName = j.accountName?.toLowerCase() ?? ''
        return (
          jobTitle.includes(searchLower) ||
          accountName.includes(searchLower)
        )
      })
    }

    return items
  }, [jobs, search, statusFilter, memberFilter])

  // Stats
  const openCount = jobs.filter((j) => j.status === 'open').length
  const totalSubmissions = jobs.reduce((acc, j) => acc + j.submissionCount, 0)

  return (
    <Card className="bg-white shadow-elevation-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading">
            Team Jobs
            {filteredJobs.length > 0 && (
              <span className="ml-2 text-sm font-normal text-charcoal-500">
                ({filteredJobs.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            <span>{openCount} open</span>
            <span>{totalSubmissions} total submissions</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open ({openCount})</SelectItem>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <p className="text-charcoal-500">No jobs found</p>
            <p className="text-sm text-charcoal-400">
              {search
                ? 'Try a different search term'
                : 'Adjust filters to see more jobs.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Open Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className="group">
                  <TableCell>
                    <Link
                      href={`/employee/recruiting/jobs/${job.id}`}
                      className="flex items-center gap-2 hover:text-hublot-700"
                    >
                      <Briefcase className="w-4 h-4 text-charcoal-400" />
                      <span className="font-medium text-charcoal-900">
                        {job.title}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {job.accountName ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Building2 className="w-3 h-3" />
                        {job.accountName}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.owner ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <User className="w-3 h-3" />
                        {job.owner.name}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-charcoal-600">
                      <Users className="w-3 h-3" />
                      <span className={cn(
                        job.submissionCount > 0 ? 'text-charcoal-900' : 'text-charcoal-400'
                      )}>
                        {job.submissionCount}
                      </span>
                    </div>
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
                    {job.openDate ? (
                      <div className="flex items-center gap-1 text-charcoal-600">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(job.openDate), {
                          addSuffix: true,
                        })}
                      </div>
                    ) : (
                      <span className="text-charcoal-400">-</span>
                    )}
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
