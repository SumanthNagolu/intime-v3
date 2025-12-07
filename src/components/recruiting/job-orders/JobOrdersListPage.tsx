'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { CreateJobOrderDialog } from './CreateJobOrderDialog'
import {
  Plus,
  Search,
  Briefcase,
  ExternalLink,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  working: 'bg-amber-100 text-amber-800',
  filled: 'bg-green-100 text-green-800',
  closed: 'bg-charcoal-100 text-charcoal-600',
  on_hold: 'bg-red-100 text-red-800',
}

const priorityColors: Record<string, string> = {
  low: 'bg-charcoal-100 text-charcoal-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
}

export function JobOrdersListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch job orders
  const jobOrdersQuery = trpc.bench.jobOrders.list.useQuery({
    search: search || undefined,
    status: statusFilter as 'new' | 'working' | 'filled' | 'closed' | 'on_hold' | 'all',
    priority: priorityFilter as 'low' | 'medium' | 'high' | 'urgent' | 'all',
    limit: 50,
  })

  const jobOrders = jobOrdersQuery.data?.items || []
  const total = jobOrdersQuery.data?.total || 0

  // Calculate summary stats
  const newCount = jobOrders.filter(jo => jo.status === 'new').length
  const workingCount = jobOrders.filter(jo => jo.status === 'working').length
  const filledCount = jobOrders.filter(jo => jo.status === 'filled').length
  const urgentCount = jobOrders.filter(jo => jo.priority === 'urgent').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Job Orders</h1>
          <p className="text-charcoal-500">Manage job orders from vendors</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Job Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">New</p>
                <p className="text-2xl font-bold text-blue-600">{newCount}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Working</p>
                <p className="text-2xl font-bold text-amber-600">{workingCount}</p>
              </div>
              <Briefcase className="w-8 h-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Filled</p>
                <p className="text-2xl font-bold text-green-600">{filledCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
              <Input
                placeholder="Search job orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} Job Order{total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobOrdersQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : jobOrders.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">No job orders found</h3>
              <p className="text-charcoal-500 mb-4">
                {search ? 'Try a different search term' : 'Start by creating a new job order'}
              </p>
              {!search && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job Order
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobOrders.map((order) => {
                  const vendor = order.vendor as { id: string; name: string } | null
                  const submissionCount = (order.submissions as { count: number }[])?.[0]?.count || 0
                  return (
                    <TableRow key={order.id} className="group">
                      <TableCell>
                        <Link href={`/employee/recruiting/job-orders/${order.id}`} className="block">
                          <div className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                            {order.title}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {vendor ? (
                          <Link href={`/employee/recruiting/vendors/${vendor.id}`} className="text-hublot-700 hover:underline">
                            {vendor.name}
                          </Link>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{order.client_name || '-'}</TableCell>
                      <TableCell>
                        {order.location ? (
                          <span className="flex items-center gap-1 text-charcoal-600">
                            <MapPin className="w-3 h-3" />
                            {order.location}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.bill_rate ? `$${order.bill_rate}/hr` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[order.status] || 'bg-charcoal-100')}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(priorityColors[order.priority] || 'bg-charcoal-100')}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-charcoal-600">{submissionCount}</span>
                      </TableCell>
                      <TableCell className="text-charcoal-500">
                        {formatDistanceToNow(new Date(order.received_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/employee/recruiting/job-orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Job Order Dialog */}
      <CreateJobOrderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  )
}
