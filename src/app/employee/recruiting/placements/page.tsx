'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
  Search,
  Filter,
  Users,
  Heart,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  Phone,
  RefreshCw,
  Building,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

const HEALTH_CONFIG = {
  healthy: {
    label: 'Healthy',
    icon: Heart,
    bgClass: 'bg-green-100 text-green-800',
  },
  at_risk: {
    label: 'At Risk',
    icon: AlertTriangle,
    bgClass: 'bg-amber-100 text-amber-800',
  },
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    bgClass: 'bg-red-100 text-red-800',
  },
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending_start', label: 'Pending Start' },
  { value: 'active', label: 'Active' },
  { value: 'ending_soon', label: 'Ending Soon', badge: true },
  { value: 'extended', label: 'Extended' },
  { value: 'completed', label: 'Completed' },
  { value: 'terminated', label: 'Terminated' },
]

const HEALTH_OPTIONS = [
  { value: 'all', label: 'All Health' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'critical', label: 'Critical' },
]

export default function PlacementsListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'pending_start' | 'active' | 'extended' | 'completed' | 'terminated' | 'on_hold' | 'ending_soon' | 'all'>('all')
  const [healthFilter, setHealthFilter] = useState<'healthy' | 'at_risk' | 'critical' | 'all'>('all')

  // Fetch placements
  const { data, isLoading, refetch } = trpc.ats.placements.list.useQuery({
    status: statusFilter !== 'all' && statusFilter !== 'ending_soon' ? statusFilter : undefined,
    healthStatus: healthFilter !== 'all' ? healthFilter : undefined,
    endingSoon: statusFilter === 'ending_soon' ? true : undefined,
    limit: 50,
  })

  // Helper to safely get nested data from Supabase (handles both array and object)
  const getFirst = <T,>(val: T | T[] | null | undefined): T | null => {
    if (!val) return null
    if (Array.isArray(val)) return val[0] ?? null
    return val
  }

  const placements = data?.items || []
  const filteredPlacements = placements.filter((p) => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    const candidate = getFirst(p.candidate)
    const job = getFirst(p.job)
    const account = getFirst(p.account)
    const candidateName = `${candidate?.first_name || ''} ${candidate?.last_name || ''}`.toLowerCase()
    const jobTitle = (job?.title || '').toLowerCase()
    const accountName = (account?.name || '').toLowerCase()
    return candidateName.includes(searchLower) || jobTitle.includes(searchLower) || accountName.includes(searchLower)
  })

  // Helper to check if placement is ending soon (within 30 days)
  const isEndingSoon = (endDate: string | null) => {
    if (!endDate) return false
    const days = differenceInDays(new Date(endDate), new Date())
    return days >= 0 && days <= 30
  }

  // Get days until end for badge display
  const getDaysUntilEnd = (endDate: string | null) => {
    if (!endDate) return null
    return differenceInDays(new Date(endDate), new Date())
  }

  // Summary stats
  const stats = {
    total: placements.length,
    active: placements.filter((p) => ['active', 'extended'].includes(p.status)).length,
    endingSoon: placements.filter((p) =>
      ['active', 'extended'].includes(p.status) && isEndingSoon(p.end_date)
    ).length,
    atRisk: placements.filter((p) => p.health_status === 'at_risk').length,
    critical: placements.filter((p) => p.health_status === 'critical').length,
    pendingCheckIn: placements.filter((p) => {
      if (!p.next_check_in_date) return false
      return differenceInDays(new Date(p.next_check_in_date), new Date()) <= 3
    }).length,
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-900">Placements</h1>
            <p className="text-charcoal-500">Manage active and past placements</p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500">Active</p>
                  <p className="text-xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'bg-white cursor-pointer transition-all hover:ring-2 hover:ring-gold-300',
              statusFilter === 'ending_soon' && 'ring-2 ring-gold-500'
            )}
            onClick={() => setStatusFilter(statusFilter === 'ending_soon' ? 'all' : 'ending_soon')}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500">Ending Soon</p>
                  <p className="text-xl font-bold">{stats.endingSoon}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500">At Risk</p>
                  <p className="text-xl font-bold">{stats.atRisk}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500">Critical</p>
                  <p className="text-xl font-bold">{stats.critical}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500">Due Check-In</p>
                  <p className="text-xl font-bold">{stats.pendingCheckIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search by candidate, job, or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={healthFilter} onValueChange={(v) => setHealthFilter(v as typeof healthFilter)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Health" />
                </SelectTrigger>
                <SelectContent>
                  {HEALTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Placements Table */}
        <Card className="bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredPlacements.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-charcoal-300" />
                <h3 className="text-lg font-medium text-charcoal-900 mb-2">No placements found</h3>
                <p className="text-charcoal-500">
                  {searchQuery || statusFilter !== 'all' || healthFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Placements will appear here when candidates are placed'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Next Check-In</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlacements.map((placement) => {
                    const healthConfig = HEALTH_CONFIG[placement.health_status as keyof typeof HEALTH_CONFIG] || HEALTH_CONFIG.healthy
                    const HealthIcon = healthConfig.icon
                    const daysActive = differenceInDays(new Date(), new Date(placement.start_date))
                    const daysRemaining = placement.end_date
                      ? differenceInDays(new Date(placement.end_date), new Date())
                      : null
                    const candidate = getFirst(placement.candidate)
                    const job = getFirst(placement.job)
                    const account = getFirst(placement.account)

                    return (
                      <TableRow
                        key={placement.id}
                        className="cursor-pointer hover:bg-charcoal-50"
                        onClick={() => router.push(`/employee/recruiting/placements/${placement.id}`)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {candidate?.first_name} {candidate?.last_name}
                            </p>
                            <p className="text-sm text-charcoal-500">
                              Started {format(new Date(placement.start_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{job?.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-charcoal-400" />
                            {account?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={healthConfig.bgClass}>
                            <HealthIcon className="w-3 h-3 mr-1" />
                            {healthConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={placement.status === 'active' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {placement.status.replace('_', ' ')}
                            </Badge>
                            {/* Urgency Badge for Ending Soon */}
                            {['active', 'extended'].includes(placement.status) && (() => {
                              const daysLeft = getDaysUntilEnd(placement.end_date)
                              if (daysLeft === null || daysLeft < 0) return null
                              if (daysLeft <= 14) {
                                return (
                                  <Badge className="bg-red-100 text-red-800 text-xs">
                                    {daysLeft}d left
                                  </Badge>
                                )
                              }
                              if (daysLeft <= 30) {
                                return (
                                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                                    {daysLeft}d left
                                  </Badge>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">{daysActive}d</span>
                            {daysRemaining !== null && (
                              <span className="text-charcoal-500 ml-1">
                                ({daysRemaining}d left)
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {placement.next_check_in_date ? (
                            <div className="text-sm">
                              <span className={cn(
                                differenceInDays(new Date(placement.next_check_in_date), new Date()) <= 3
                                  ? 'text-amber-600 font-medium'
                                  : 'text-charcoal-600'
                              )}>
                                {format(new Date(placement.next_check_in_date), 'MMM d')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-charcoal-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-charcoal-400" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
