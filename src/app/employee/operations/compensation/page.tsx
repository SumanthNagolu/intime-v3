'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Loader2,
  Filter,
  Search,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const CHANGE_TYPE_CONFIG = {
  hire: { label: 'New Hire', color: 'bg-blue-100 text-blue-700', icon: Users },
  promotion: { label: 'Promotion', color: 'bg-green-100 text-green-700', icon: TrendingUp },
  merit_increase: { label: 'Merit Increase', color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
  market_adjustment: { label: 'Market Adj.', color: 'bg-purple-100 text-purple-700', icon: BarChart3 },
  transfer: { label: 'Transfer', color: 'bg-amber-100 text-amber-700', icon: ArrowUpRight },
  demotion: { label: 'Demotion', color: 'bg-red-100 text-red-700', icon: TrendingDown },
  correction: { label: 'Correction', color: 'bg-charcoal-100 text-charcoal-700', icon: Minus },
}

const COMPA_RATIO_BUCKETS = [
  { key: 'below80', label: '< 80%', color: 'bg-red-500', description: 'Significantly below range' },
  { key: 'between80_90', label: '80-90%', color: 'bg-amber-500', description: 'Below range' },
  { key: 'between90_100', label: '90-100%', color: 'bg-yellow-500', description: 'At range' },
  { key: 'between100_110', label: '100-110%', color: 'bg-green-500', description: 'At range' },
  { key: 'between110_120', label: '110-120%', color: 'bg-emerald-500', description: 'Above range' },
  { key: 'above120', label: '> 120%', color: 'bg-blue-500', description: 'Significantly above range' },
]

export default function CompensationPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data
  const { data: salaryBands, isLoading: salaryLoading } = trpc.compensation.analytics.getSalaryBands.useQuery({
    departmentId: selectedDepartment || undefined,
  })

  const { data: compaRatios, isLoading: compaLoading } = trpc.compensation.analytics.getCompaRatios.useQuery({
    departmentId: selectedDepartment || undefined,
  })

  const { data: changesTrend, isLoading: trendLoading } = trpc.compensation.analytics.getChangesTrend.useQuery({})

  const { data: departments } = trpc.departments.list.useQuery({})

  const isLoading = salaryLoading || compaLoading || trendLoading

  // Filter employees by search
  const filteredEmployees = salaryBands?.employees?.filter(emp => {
    if (!searchQuery) return true
    const name = (emp.job_title || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  }) ?? []

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">Compensation</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Salary analytics and compensation management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-charcoal-400" />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments?.items?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Average Salary</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : salaryBands?.average ? formatCurrency(salaryBands.average) : '—'}
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {salaryBands?.count ?? 0} employees
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Median Salary</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : salaryBands?.median ? formatCurrency(salaryBands.median) : '—'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Avg Compa-Ratio</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : compaRatios?.averageCompaRatio ? `${(compaRatios.averageCompaRatio * 100).toFixed(0)}%` : '—'}
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {compaRatios?.total ?? 0} with positions
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Salary Range</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : salaryBands?.min && salaryBands?.max
                    ? `${formatCurrency(salaryBands.min).replace('.00', '')} - ${formatCurrency(salaryBands.max).replace('.00', '')}`
                    : '—'
                  }
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compa-ratios">Compa-Ratios</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compa-Ratio Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-heading font-semibold">Compa-Ratio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {compaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                  </div>
                ) : !compaRatios?.total ? (
                  <div className="flex flex-col items-center py-12">
                    <p className="text-charcoal-500">No compa-ratio data available.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {COMPA_RATIO_BUCKETS.map((bucket) => {
                      const count = compaRatios.distribution[bucket.key as keyof typeof compaRatios.distribution] || 0
                      const percentage = compaRatios.total > 0 ? (count / compaRatios.total) * 100 : 0
                      return (
                        <div key={bucket.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn('w-3 h-3 rounded-full', bucket.color)} />
                              <span className="text-sm font-medium text-charcoal-900">{bucket.label}</span>
                              <span className="text-xs text-charcoal-500">({bucket.description})</span>
                            </div>
                            <span className="text-sm text-charcoal-600">{count} ({Math.round(percentage)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Compensation Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-heading font-semibold">Compensation Changes (12 months)</CardTitle>
              </CardHeader>
              <CardContent>
                {trendLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                  </div>
                ) : !changesTrend?.length ? (
                  <div className="flex flex-col items-center py-12">
                    <p className="text-charcoal-500">No compensation changes in the past 12 months.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-2 text-xs text-charcoal-500 font-medium uppercase tracking-wider pb-2 border-b">
                      <span>Month</span>
                      <span className="text-right">Total</span>
                      <span className="text-right">Promos</span>
                      <span className="text-right">Merit</span>
                      <span className="text-right">Avg %</span>
                    </div>
                    {changesTrend.slice(-6).map((month, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-2 text-sm">
                        <span className="text-charcoal-600">{month.month}</span>
                        <span className="text-right font-medium text-charcoal-900">{month.total}</span>
                        <span className="text-right text-green-600">{month.promotions}</span>
                        <span className="text-right text-emerald-600">{month.merit_increases}</span>
                        <span className="text-right text-charcoal-600">
                          {month.avgChangePercent ? `${month.avgChangePercent.toFixed(1)}%` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Salary Summary by Type */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-semibold">Salary Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Minimum</p>
                    <p className="text-xl font-semibold text-charcoal-900 mt-1">
                      {salaryBands?.min ? formatCurrency(salaryBands.min) : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Average</p>
                    <p className="text-xl font-semibold text-charcoal-900 mt-1">
                      {salaryBands?.average ? formatCurrency(salaryBands.average) : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Median</p>
                    <p className="text-xl font-semibold text-charcoal-900 mt-1">
                      {salaryBands?.median ? formatCurrency(salaryBands.median) : '—'}
                    </p>
                  </div>
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Maximum</p>
                    <p className="text-xl font-semibold text-charcoal-900 mt-1">
                      {salaryBands?.max ? formatCurrency(salaryBands.max) : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compa-Ratios Tab */}
        <TabsContent value="compa-ratios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">Employee Compa-Ratios</CardTitle>
            </CardHeader>
            <CardContent>
              {salaryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : !salaryBands?.employees?.length ? (
                <div className="flex flex-col items-center py-12">
                  <p className="text-charcoal-500">No employee compensation data available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {salaryBands.employees
                    .filter(emp => emp.position_id)
                    .slice(0, 20)
                    .map((emp) => {
                      const position = emp.position as {
                        salary_band_min: number
                        salary_band_mid: number
                        salary_band_max: number
                      } | null

                      const compaRatio = position?.salary_band_mid
                        ? (emp.salary_amount / position.salary_band_mid) * 100
                        : null

                      const bandMin = position?.salary_band_min || 0
                      const bandMax = position?.salary_band_max || 0
                      const bandRange = bandMax - bandMin
                      const salaryPosition = bandRange > 0
                        ? ((emp.salary_amount - bandMin) / bandRange) * 100
                        : 50

                      return (
                        <div
                          key={emp.id}
                          className="p-4 rounded-lg border border-charcoal-100 hover:bg-charcoal-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-charcoal-900">{emp.job_title}</p>
                              <p className="text-sm text-charcoal-500">{emp.department}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-charcoal-900">{formatCurrency(emp.salary_amount)}</p>
                              {compaRatio && (
                                <Badge className={cn(
                                  compaRatio < 90 ? 'bg-red-100 text-red-700' :
                                  compaRatio < 100 ? 'bg-amber-100 text-amber-700' :
                                  compaRatio <= 110 ? 'bg-green-100 text-green-700' :
                                  'bg-blue-100 text-blue-700'
                                )}>
                                  {compaRatio.toFixed(0)}% CR
                                </Badge>
                              )}
                            </div>
                          </div>

                          {position && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-charcoal-500">
                                <span>{formatCurrency(bandMin)}</span>
                                <span className="font-medium">Mid: {formatCurrency(position.salary_band_mid)}</span>
                                <span>{formatCurrency(bandMax)}</span>
                              </div>
                              <div className="relative h-2 bg-charcoal-100 rounded-full">
                                <div
                                  className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500"
                                  style={{ width: '100%' }}
                                />
                                <div
                                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-charcoal-900 border-2 border-white shadow-sm"
                                  style={{ left: `${Math.min(Math.max(salaryPosition, 0), 100)}%`, transform: 'translate(-50%, -50%)' }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">Compensation Change Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {trendLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : !changesTrend?.length ? (
                <div className="flex flex-col items-center py-12">
                  <p className="text-charcoal-500">No trend data available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-charcoal-50 rounded-lg">
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Total Changes</p>
                      <p className="text-2xl font-semibold text-charcoal-900 mt-1">
                        {changesTrend.reduce((sum, m) => sum + m.total, 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600 uppercase tracking-wider">Promotions</p>
                      <p className="text-2xl font-semibold text-green-700 mt-1">
                        {changesTrend.reduce((sum, m) => sum + m.promotions, 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-600 uppercase tracking-wider">Merit Increases</p>
                      <p className="text-2xl font-semibold text-emerald-700 mt-1">
                        {changesTrend.reduce((sum, m) => sum + m.merit_increases, 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 uppercase tracking-wider">Market Adjustments</p>
                      <p className="text-2xl font-semibold text-purple-700 mt-1">
                        {changesTrend.reduce((sum, m) => sum + m.market_adjustments, 0)}
                      </p>
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-charcoal-900">Monthly Breakdown</h4>
                    {changesTrend.map((month, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg border border-charcoal-100"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-charcoal-900">{month.month}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-charcoal-600">{month.total} change{month.total !== 1 ? 's' : ''}</span>
                            {month.avgChangePercent > 0 && (
                              <Badge className="bg-green-100 text-green-700">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Avg +{month.avgChangePercent.toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {month.promotions > 0 && (
                            <Badge variant="secondary" className="bg-green-50 text-green-700">
                              {month.promotions} promotion{month.promotions !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {month.merit_increases > 0 && (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                              {month.merit_increases} merit
                            </Badge>
                          )}
                          {month.market_adjustments > 0 && (
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                              {month.market_adjustments} market adj.
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-heading font-semibold">Employee Compensation</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                  <Input
                    placeholder="Search by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[250px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {salaryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : !filteredEmployees.length ? (
                <div className="flex flex-col items-center py-12">
                  <p className="text-charcoal-500">No employees found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEmployees.slice(0, 50).map((emp) => {
                    const position = emp.position as {
                      title: string
                      salary_band_min: number
                      salary_band_mid: number
                      salary_band_max: number
                    } | null

                    const compaRatio = position?.salary_band_mid
                      ? (emp.salary_amount / position.salary_band_mid) * 100
                      : null

                    return (
                      <Link
                        key={emp.id}
                        href={`/employee/operations/compensation/${emp.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:bg-charcoal-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-600 font-semibold">
                            {emp.job_title?.charAt(0) ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900">{emp.job_title}</p>
                            <div className="flex items-center gap-2 text-sm text-charcoal-500">
                              {emp.department && (
                                <>
                                  <Building2 className="h-3.5 w-3.5" />
                                  <span>{emp.department}</span>
                                </>
                              )}
                              {position && (
                                <>
                                  <span className="text-charcoal-300">•</span>
                                  <span>{position.title}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-charcoal-900">{formatCurrency(emp.salary_amount)}</p>
                            <p className="text-xs text-charcoal-500 capitalize">{emp.salary_type}</p>
                          </div>
                          {compaRatio && (
                            <Badge className={cn(
                              compaRatio < 90 ? 'bg-red-100 text-red-700' :
                              compaRatio < 100 ? 'bg-amber-100 text-amber-700' :
                              compaRatio <= 110 ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                            )}>
                              {compaRatio.toFixed(0)}%
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
