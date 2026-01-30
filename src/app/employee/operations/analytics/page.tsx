'use client'

import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

export default function HRAnalyticsPage() {
  const { data: dashboard, isLoading: dashboardLoading } = trpc.hrAnalytics.dashboard.useQuery()
  const { data: headcountTrend } = trpc.hrAnalytics.headcount.trend.useQuery({ months: 12 })
  const { data: turnoverSummary } = trpc.hrAnalytics.turnover.summary.useQuery({ months: 12 })
  const { data: tenureDistribution } = trpc.hrAnalytics.tenure.distribution.useQuery()
  const { data: headcountByDept } = trpc.hrAnalytics.headcount.byDepartment.useQuery()

  const isLoading = dashboardLoading

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">HR Analytics</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Workforce metrics and insights
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Total Headcount</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.headcount?.total ?? 0}
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {dashboard?.headcount?.fullTime ?? 0} FT, {dashboard?.headcount?.contractor ?? 0} contractors
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">New Hires (30d)</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.newHires ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Terminations (30d)</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.terminations ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Turnover Rate (12m)</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {turnoverSummary ? `${turnoverSummary.turnoverRate}%` : '—'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Headcount by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {!headcountByDept?.length ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-charcoal-500">No department data available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {headcountByDept.slice(0, 8).map((dept, idx) => {
                  const maxCount = Math.max(...headcountByDept.map(d => d.count))
                  const percentage = (dept.count / maxCount) * 100
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-charcoal-900">{dept.name}</span>
                        <span className="text-sm text-charcoal-600">{dept.count}</span>
                      </div>
                      <div className="w-full bg-charcoal-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenure Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Tenure Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {!tenureDistribution?.length ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-charcoal-500">No tenure data available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tenureDistribution.map((bucket, idx) => {
                  const total = tenureDistribution.reduce((sum, b) => sum + b.count, 0)
                  const percentage = total > 0 ? (bucket.count / total) * 100 : 0
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-charcoal-900">{bucket.bucket}</span>
                        <span className="text-sm text-charcoal-600">{bucket.count} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full bg-charcoal-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Headcount Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Headcount Trend (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {!headcountTrend?.length ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-charcoal-500">No trend data available.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4 text-xs text-charcoal-500 font-medium uppercase tracking-wider pb-2 border-b">
                  <span>Month</span>
                  <span className="text-right">Headcount</span>
                  <span className="text-right">Hires</span>
                  <span className="text-right">Terms</span>
                </div>
                {headcountTrend.slice(-6).map((month, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 text-sm">
                    <span className="text-charcoal-600">{month.month}</span>
                    <span className="text-right font-medium text-charcoal-900">{month.headcount}</span>
                    <span className="text-right text-green-600">+{month.hires}</span>
                    <span className="text-right text-red-600">-{month.terminations}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Turnover Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading font-semibold">Turnover Analysis (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {!turnoverSummary ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Total Terminations</p>
                    <p className="text-2xl font-semibold text-charcoal-900 mt-1">{turnoverSummary.totalTerminations}</p>
                  </div>
                  <div className="p-4 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Turnover Rate</p>
                    <p className="text-2xl font-semibold text-charcoal-900 mt-1">{turnoverSummary.turnoverRate}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-charcoal-100 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Voluntary</p>
                    <p className="text-xl font-semibold text-amber-600 mt-1">{turnoverSummary.voluntary}</p>
                    <p className="text-xs text-charcoal-500 mt-1">{turnoverSummary.voluntaryRate}% rate</p>
                  </div>
                  <div className="p-4 border border-charcoal-100 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Involuntary</p>
                    <p className="text-xl font-semibold text-red-600 mt-1">{turnoverSummary.involuntary}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Time Off</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.pendingTimeOff ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Reviews</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.pendingReviews ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Active Goals</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.activeGoals ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
