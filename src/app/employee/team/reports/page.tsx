'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import {
  FileBarChart,
  Users,
  DollarSign,
  Briefcase,
  Target,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const PERIODS = [
  { value: 'this_sprint', label: 'This Sprint' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
]

// KPI Card Component
interface KPICardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  isLoading?: boolean
}

function KPICard({ title, value, change, changeLabel = 'vs last period', icon, isLoading }: KPICardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all hover:shadow-elevation-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="p-2 bg-charcoal-100 rounded-lg">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-charcoal-900 mb-2">{value}</p>
        {change !== undefined && (
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium',
            change > 0 ? 'text-success-600' : change < 0 ? 'text-error-600' : 'text-charcoal-500'
          )}>
            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {change > 0 ? '+' : ''}{change}%
            <span className="text-charcoal-400 font-normal">{changeLabel}</span>
          </span>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Team Reports Page
 * Shows team performance reports and analytics using real data
 */
export default function TeamReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'this_sprint' | 'this_month' | 'this_quarter' | 'ytd'>('this_month')

  // Use the same dashboard data but for team context
  const { data: dashboard, isLoading, refetch } = trpc.reports.getLiveDashboard.useQuery(
    { period: selectedPeriod },
    { refetchInterval: 60000 }
  )

  const { data: trends, isLoading: loadingTrends } = trpc.reports.getPerformanceTrends.useQuery(
    { period: selectedPeriod, granularity: 'day' }
  )

  const { data: funnel, isLoading: loadingFunnel } = trpc.reports.getPipelineFunnel.useQuery(
    { period: selectedPeriod }
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-charcoal-900">
            Team Analytics
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            Performance trends, quality metrics, and team comparisons
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <KPICard
              title="Total Placements"
              value={dashboard?.current.placements ?? 0}
              change={dashboard?.changes.placements}
              icon={<Briefcase className="w-4 h-4 text-charcoal-600" />}
              isLoading={isLoading}
            />
            <KPICard
              title="Total Revenue"
              value={`$${((dashboard?.current.revenue ?? 0) / 1000).toFixed(1)}k`}
              change={dashboard?.changes.revenue}
              icon={<DollarSign className="w-4 h-4 text-charcoal-600" />}
              isLoading={isLoading}
            />
            <KPICard
              title="Submissions"
              value={dashboard?.current.submissions ?? 0}
              change={dashboard?.changes.submissions}
              icon={<FileBarChart className="w-4 h-4 text-charcoal-600" />}
              isLoading={isLoading}
            />
            <KPICard
              title="Interviews"
              value={dashboard?.current.interviews ?? 0}
              change={dashboard?.changes.interviews}
              icon={<Users className="w-4 h-4 text-charcoal-600" />}
              isLoading={isLoading}
            />
            <KPICard
              title="Candidates Sourced"
              value={dashboard?.current.candidatesSourced ?? 0}
              change={dashboard?.changes.candidatesSourced}
              icon={<Target className="w-4 h-4 text-charcoal-600" />}
              isLoading={isLoading}
            />
          </div>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Metrics</CardTitle>
              <CardDescription>Key performance indicators for team quality</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-3xl font-bold text-charcoal-900">
                      {dashboard?.current.submissionToInterviewRate ?? 0}%
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">Submission Quality</p>
                    <p className="text-xs text-charcoal-400">(% reaching interview)</p>
                  </div>
                  <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-3xl font-bold text-charcoal-900">
                      {dashboard?.current.interviewToOfferRate ?? 0}%
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">Interview to Offer</p>
                    <p className="text-xs text-charcoal-400">(conversion rate)</p>
                  </div>
                  <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-3xl font-bold text-charcoal-900">
                      {dashboard?.current.offerAcceptanceRate ?? 0}%
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">Offer Acceptance</p>
                    <p className="text-xs text-charcoal-400">(% accepted)</p>
                  </div>
                  <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-3xl font-bold text-charcoal-900">
                      {dashboard?.current.fillRate ?? 0}%
                    </p>
                    <p className="text-xs text-charcoal-500 mt-1">Fill Rate</p>
                    <p className="text-xs text-charcoal-400">(submissions placed)</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Average Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Averages</CardTitle>
              <CardDescription>Average performance per team member</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-24" />
              ) : (
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-xs text-charcoal-500 mb-1">Avg Placements</p>
                    <p className="text-2xl font-bold text-charcoal-900">{dashboard?.teamAverage.placements ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 mb-1">Avg Revenue</p>
                    <p className="text-2xl font-bold text-charcoal-900">${((dashboard?.teamAverage.revenue ?? 0) / 1000).toFixed(1)}k</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 mb-1">Avg Submissions</p>
                    <p className="text-2xl font-bold text-charcoal-900">{dashboard?.teamAverage.submissions ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 mb-1">Avg Interviews</p>
                    <p className="text-2xl font-bold text-charcoal-900">{dashboard?.teamAverage.interviews ?? 0}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
              <CardDescription>
                Overall conversion: {funnel?.conversionRates.overallConversion ?? 0}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFunnel ? (
                <Skeleton className="h-64" />
              ) : (
                <div className="space-y-4">
                  {funnel?.stages.map((stage, index) => {
                    const maxCount = Math.max(...(funnel?.stages.map(s => s.count) ?? [0]))
                    const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
                    const conversionKey = index === 0 ? null :
                      index === 1 ? 'submissionRate' :
                      index === 2 ? 'interviewRate' :
                      index === 3 ? 'offerRate' :
                      'placementRate'

                    return (
                      <div key={stage.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-charcoal-700">{stage.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-charcoal-900">{stage.count}</span>
                            {conversionKey && funnel?.conversionRates[conversionKey as keyof typeof funnel.conversionRates] !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {funnel?.conversionRates[conversionKey as keyof typeof funnel.conversionRates]}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-8 bg-charcoal-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%`, backgroundColor: stage.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submissions Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Submissions Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTrends ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(trends?.submissions ?? []).map(d => ({
                        ...d,
                        label: 'date' in d ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (d as { label?: string }).label ?? '',
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activities Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Activities Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTrends ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(trends?.activities ?? []).map(d => ({
                        ...d,
                        label: 'date' in d ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (d as { label?: string }).label ?? '',
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Placements Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Placements Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTrends ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(trends?.placements ?? []).map(d => ({
                        ...d,
                        label: 'date' in d ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (d as { label?: string }).label ?? '',
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interviews Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Interviews Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTrends ? (
                  <Skeleton className="h-64" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={(trends?.interviews ?? []).map(d => ({
                        ...d,
                        label: 'date' in d ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : (d as { label?: string }).label ?? '',
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
