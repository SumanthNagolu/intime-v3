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
import { OnboardTalentDialog } from './OnboardTalentDialog'
import {
  Plus,
  Search,
  Users,
  ExternalLink,
  Loader2,
  Clock,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<string, string> = {
  onboarding: 'bg-blue-100 text-blue-800',
  available: 'bg-green-100 text-green-800',
  marketing: 'bg-purple-100 text-purple-800',
  interviewing: 'bg-amber-100 text-amber-800',
  placed: 'bg-teal-100 text-teal-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
}

const marketingStatusColors: Record<string, string> = {
  draft: 'bg-charcoal-100 text-charcoal-600',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-amber-100 text-amber-800',
  archived: 'bg-red-100 text-red-800',
}

const visaLabels: Record<string, string> = {
  h1b: 'H-1B',
  h1b_transfer: 'H-1B Transfer',
  l1: 'L1',
  opt: 'OPT',
  opt_stem: 'OPT STEM',
  cpt: 'CPT',
  gc: 'Green Card',
  us_citizen: 'US Citizen',
  ead: 'EAD',
  tn: 'TN',
}

export function TalentListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [marketingStatusFilter, setMarketingStatusFilter] = useState<string>('all')
  const [visaFilter, setVisaFilter] = useState('')
  const [onboardDialogOpen, setOnboardDialogOpen] = useState(false)

  // Fetch talent (bench consultants)
  const talentQuery = trpc.bench.talent.list.useQuery({
    search: search || undefined,
    status: statusFilter as 'onboarding' | 'available' | 'marketing' | 'interviewing' | 'placed' | 'inactive' | 'all',
    marketingStatus: marketingStatusFilter as 'draft' | 'active' | 'paused' | 'archived' | 'all',
    visaType: visaFilter || undefined,
    limit: 50,
  })

  // Fetch expiring visas for alerts
  const expiringVisasQuery = trpc.bench.talent.getExpiringVisas.useQuery({ daysAhead: 90 })

  const talent = talentQuery.data?.items || []
  const total = talentQuery.data?.total || 0
  const expiringVisas = expiringVisasQuery.data || []

  // Calculate summary stats
  const availableCount = talent.filter(t => t.status === 'available').length
  const marketingCount = talent.filter(t => t.status === 'marketing').length
  const interviewingCount = talent.filter(t => t.status === 'interviewing').length
  const placedCount = talent.filter(t => t.status === 'placed').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Talent Pool</h1>
          <p className="text-charcoal-500">Manage bench consultants and talent from vendors</p>
        </div>
        <Button onClick={() => setOnboardDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Onboard Talent
        </Button>
      </div>

      {/* Visa Expiration Alert */}
      {expiringVisas.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {expiringVisas.length} visa{expiringVisas.length !== 1 ? 's' : ''} expiring in the next 90 days
                </p>
                <p className="text-sm text-amber-600">
                  Review and take action to ensure compliance
                </p>
              </div>
              <Link href="/employee/recruiting/talent?visa_expiring=true" className="ml-auto">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Total Talent</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Users className="w-8 h-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableCount}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Marketing</p>
                <p className="text-2xl font-bold text-purple-600">{marketingCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Interviewing</p>
                <p className="text-2xl font-bold text-amber-600">{interviewingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Placed</p>
                <p className="text-2xl font-bold text-teal-600">{placedCount}</p>
              </div>
              <Briefcase className="w-8 h-8 text-teal-300" />
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
                placeholder="Search talent by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={marketingStatusFilter} onValueChange={setMarketingStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Marketing Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Marketing</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={visaFilter} onValueChange={setVisaFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visa Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Visas</SelectItem>
                <SelectItem value="h1b">H-1B</SelectItem>
                <SelectItem value="h1b_transfer">H-1B Transfer</SelectItem>
                <SelectItem value="l1">L1</SelectItem>
                <SelectItem value="opt">OPT</SelectItem>
                <SelectItem value="opt_stem">OPT STEM</SelectItem>
                <SelectItem value="cpt">CPT</SelectItem>
                <SelectItem value="gc">Green Card</SelectItem>
                <SelectItem value="us_citizen">US Citizen</SelectItem>
                <SelectItem value="ead">EAD</SelectItem>
                <SelectItem value="tn">TN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Talent Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {total} Talent{total !== 1 ? '' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {talentQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : talent.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">No talent found</h3>
              <p className="text-charcoal-500 mb-4">
                {search ? 'Try a different search term' : 'Get started by onboarding your first talent'}
              </p>
              {!search && (
                <Button onClick={() => setOnboardDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Onboard Talent
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Talent</TableHead>
                  <TableHead>Visa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Bench Since</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talent.map((t) => {
                  const candidate = t.candidate as { id: string; full_name: string; email?: string; location?: string } | null
                  const benchSalesRep = t.bench_sales_rep as { id: string; full_name: string } | null
                  return (
                    <TableRow key={t.id} className="group">
                      <TableCell>
                        <Link href={`/employee/recruiting/talent/${t.id}`} className="block">
                          <div className="font-medium text-charcoal-900 group-hover:text-hublot-700">
                            {candidate?.full_name || 'Unknown'}
                          </div>
                          {candidate?.location && (
                            <div className="flex items-center gap-1 text-sm text-charcoal-500">
                              <MapPin className="w-3 h-3" />
                              {candidate.location}
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {t.visa_type ? (
                          <Badge variant="outline">
                            {visaLabels[t.visa_type] || t.visa_type}
                          </Badge>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[t.status] || 'bg-charcoal-100')}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(marketingStatusColors[t.marketing_status] || 'bg-charcoal-100')}>
                          {t.marketing_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t.target_rate ? (
                          <span className="text-charcoal-700">
                            ${t.target_rate}/{t.currency === 'USD' ? 'hr' : t.currency}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-charcoal-500">
                        {formatDistanceToNow(new Date(t.bench_start_date), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {benchSalesRep ? (
                          <span className="text-charcoal-600">{benchSalesRep.full_name}</span>
                        ) : (
                          <span className="text-charcoal-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/employee/recruiting/talent/${t.id}`}>
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

      {/* Onboard Talent Dialog */}
      <OnboardTalentDialog open={onboardDialogOpen} onOpenChange={setOnboardDialogOpen} />
    </div>
  )
}
