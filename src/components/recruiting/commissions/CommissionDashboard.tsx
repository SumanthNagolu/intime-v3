'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  TrendingUp,
  Building,
  Download,
  Clock,
  BarChart3,
  Users,
  RefreshCw,
} from 'lucide-react'
// date-fns is used internally by tRPC procedures
import { cn } from '@/lib/utils'

const COMMISSION_RATE = 0.05 // 5% of gross billing
const HOURS_PER_MONTH = 160

type Period = 'current' | 'previous' | 'ytd'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'current', label: 'This Month' },
  { value: 'previous', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' },
]

export function CommissionDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('current')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const { data: commissionData, isLoading, refetch, isRefetching } = trpc.ats.commissions.getSummary.useQuery({
    period: selectedPeriod,
    year: parseInt(selectedYear),
  })

  const { data: trendData, isLoading: isTrendLoading } = trpc.ats.commissions.getTrend.useQuery({
    months: 6,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleExportCSV = () => {
    if (!commissionData?.commissionsByPlacement) return

    const headers = ['Candidate', 'Account', 'Bill Rate', 'Gross Billing', 'Commission', 'Status']
    const rows = commissionData.commissionsByPlacement.map((c) => [
      c.candidateName,
      c.accountName,
      `$${c.billRate}/hr`,
      formatCurrency(c.grossBilling),
      formatCurrency(c.commission),
      c.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commissions-${selectedPeriod}-${selectedYear}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate max for trend chart
  const maxTrendValue = trendData
    ? Math.max(...trendData.map((d) => d.commission), 1)
    : 1

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-cream min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-gold-500" />
            MY COMMISSIONS
          </h1>
          <p className="text-charcoal-500 text-sm mt-1">
            Track your placement earnings using the 5% of gross billing model
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2025, 2024, 2023].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn('w-4 h-4', isRefetching && 'animate-spin')} />
          </Button>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Commission */}
        <Card className="bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gold-700 font-medium">Commission Earned</p>
                <p className="text-3xl font-bold text-gold-900 mt-1">
                  {formatCurrency(commissionData?.totalCommission || 0)}
                </p>
                <p className="text-xs text-gold-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold-200 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gold-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gross Billing */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500 font-medium">Gross Billings</p>
                <p className="text-2xl font-bold text-charcoal-900 mt-1">
                  {formatCurrency(commissionData?.totalGrossBilling || 0)}
                </p>
                <p className="text-xs text-charcoal-400 mt-1">
                  Commission Rate: {(commissionData?.commissionRate || COMMISSION_RATE) * 100}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Placements */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500 font-medium">Placements</p>
                <p className="text-2xl font-bold text-charcoal-900 mt-1">
                  {commissionData?.placementsCount || 0}
                </p>
                <p className="text-xs text-charcoal-400 mt-1">
                  Generating commission
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Average */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500 font-medium">Avg per Placement</p>
                <p className="text-2xl font-bold text-charcoal-900 mt-1">
                  {commissionData && commissionData.placementsCount > 0
                    ? formatCurrency(commissionData.totalCommission / commissionData.placementsCount)
                    : '$0'}
                </p>
                <p className="text-xs text-charcoal-400 mt-1">
                  Monthly commission
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Calculation Explainer */}
      <Card className="bg-charcoal-50 border-charcoal-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-200 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-charcoal-600" />
            </div>
            <div>
              <p className="font-medium text-charcoal-900">Commission Formula</p>
              <p className="text-sm text-charcoal-600">
                <code className="bg-charcoal-200 px-1.5 py-0.5 rounded text-xs">
                  Commission = Bill Rate x {HOURS_PER_MONTH} hours x 5%
                </code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission by Placement Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-charcoal-400" />
            Commission by Placement
          </CardTitle>
          <CardDescription>
            Breakdown of your commission earnings by active placement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissionData?.commissionsByPlacement && commissionData.commissionsByPlacement.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Bill Rate</TableHead>
                  <TableHead className="text-right">Monthly Billing</TableHead>
                  <TableHead className="text-right">Commission (5%)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionData.commissionsByPlacement.map((placement) => (
                  <TableRow key={placement.placementId}>
                    <TableCell className="font-medium">{placement.candidateName}</TableCell>
                    <TableCell>{placement.accountName}</TableCell>
                    <TableCell className="text-right">${placement.billRate}/hr</TableCell>
                    <TableCell className="text-right">{formatCurrency(placement.grossBilling)}</TableCell>
                    <TableCell className="text-right font-semibold text-gold-700">
                      {formatCurrency(placement.commission)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          placement.status === 'active' ? 'default' :
                          placement.status === 'extended' ? 'secondary' :
                          'outline'
                        }
                        className={cn(
                          placement.status === 'active' && 'bg-green-100 text-green-800 hover:bg-green-100',
                          placement.status === 'extended' && 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                        )}
                      >
                        {placement.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-charcoal-50 font-semibold">
                  <TableCell colSpan={3}>Total ({commissionData.placementsCount} placements)</TableCell>
                  <TableCell className="text-right">{formatCurrency(commissionData.totalGrossBilling)}</TableCell>
                  <TableCell className="text-right text-gold-700">
                    {formatCurrency(commissionData.totalCommission)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-charcoal-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
              <p className="font-medium">No placements found</p>
              <p className="text-sm">Commission will appear here when you have active placements</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-charcoal-400" />
            Commission Trend
          </CardTitle>
          <CardDescription>
            Your commission earnings over the past 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTrendLoading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          ) : trendData && trendData.length > 0 ? (
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="flex items-end gap-2 h-40">
                {trendData.map((month, index) => {
                  const heightPercent = maxTrendValue > 0 ? (month.commission / maxTrendValue) * 100 : 0
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'w-full rounded-t transition-all duration-300',
                          index === trendData.length - 1 ? 'bg-gold-500' : 'bg-charcoal-200',
                        )}
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        title={`${month.month}: ${formatCurrency(month.commission)}`}
                      />
                    </div>
                  )
                })}
              </div>
              {/* Labels */}
              <div className="flex gap-2">
                {trendData.map((month) => (
                  <div key={month.month} className="flex-1 text-center">
                    <p className="text-xs text-charcoal-500 truncate">{month.month}</p>
                    <p className="text-xs font-medium text-charcoal-700">
                      {formatCurrency(month.commission)}
                    </p>
                  </div>
                ))}
              </div>
              {/* Summary */}
              <div className="flex justify-between pt-3 border-t border-charcoal-100">
                <div>
                  <p className="text-xs text-charcoal-500">Average Monthly</p>
                  <p className="font-medium text-charcoal-900">
                    {formatCurrency(
                      trendData.reduce((sum, m) => sum + m.commission, 0) / trendData.length
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-charcoal-500">Best Month</p>
                  <p className="font-medium text-charcoal-900">
                    {formatCurrency(Math.max(...trendData.map((m) => m.commission)))}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-charcoal-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-charcoal-300" />
                <p>No trend data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
