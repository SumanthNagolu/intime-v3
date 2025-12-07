'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface VendorPerformanceDashboardProps {
  vendorId: string
  vendorName: string
}

export function VendorPerformanceDashboard({ vendorId, vendorName }: VendorPerformanceDashboardProps) {
  // Fetch vendor performance data
  const performanceQuery = trpc.bench.vendors.getPerformance.useQuery({ vendorId })

  const performance = performanceQuery.data

  if (performanceQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-charcoal-100 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-48 bg-charcoal-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  // Default/mock data if not available
  const metrics = performance || {
    totalJobOrders: 0,
    activeJobOrders: 0,
    totalSubmissions: 0,
    successfulPlacements: 0,
    averageFillTime: 0,
    fillRate: 0,
    submissionToInterviewRate: 0,
    interviewToOfferRate: 0,
    averageMargin: 0,
    totalRevenue: 0,
    rating: 0,
    lastActivityDate: null,
  }

  // Calculate trends (mock - in reality would compare to previous period)
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600'
    if (rating >= 3) return 'text-amber-600'
    return 'text-red-600'
  }

  const fillRateColor = metrics.fillRate >= 50 ? 'bg-green-500' : metrics.fillRate >= 25 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Job Orders</p>
                <p className="text-2xl font-bold text-charcoal-900">{metrics.totalJobOrders}</p>
                <p className="text-xs text-charcoal-500">{metrics.activeJobOrders} active</p>
              </div>
              <FileText className="h-8 w-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Submissions</p>
                <p className="text-2xl font-bold text-charcoal-900">{metrics.totalSubmissions}</p>
                <p className="text-xs text-green-600">{metrics.successfulPlacements} placed</p>
              </div>
              <Users className="h-8 w-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Fill Rate</p>
                <p className="text-2xl font-bold text-charcoal-900">{Math.round(metrics.fillRate)}%</p>
                <Progress value={metrics.fillRate} className="mt-2 h-1.5" />
              </div>
              <BarChart3 className="h-8 w-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-500">Avg. Fill Time</p>
                <p className="text-2xl font-bold text-charcoal-900">{metrics.averageFillTime || '-'}</p>
                <p className="text-xs text-charcoal-500">days</p>
              </div>
              <Clock className="h-8 w-8 text-charcoal-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Submission to placement conversion rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">Submission → Interview</span>
                <span className="font-medium">{Math.round(metrics.submissionToInterviewRate || 0)}%</span>
              </div>
              <Progress value={metrics.submissionToInterviewRate || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">Interview → Offer</span>
                <span className="font-medium">{Math.round(metrics.interviewToOfferRate || 0)}%</span>
              </div>
              <Progress value={metrics.interviewToOfferRate || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">Overall Fill Rate</span>
                <span className="font-medium">{Math.round(metrics.fillRate || 0)}%</span>
              </div>
              <Progress value={metrics.fillRate || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue and margin metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-charcoal-600">Total Revenue</p>
                  <p className="font-bold text-charcoal-900">
                    ${metrics.totalRevenue?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-charcoal-600">Average Margin</p>
                  <p className="font-bold text-charcoal-900">{metrics.averageMargin || 0}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Rating & Status */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className={cn("text-4xl font-bold", getRatingColor(metrics.rating || 0))}>
                {metrics.rating?.toFixed(1) || 'N/A'}
              </p>
              <p className="text-sm text-charcoal-500 mt-1">out of 5.0</p>
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={cn(
                      "w-6 h-6 rounded-full",
                      star <= (metrics.rating || 0) ? "bg-gold-500" : "bg-charcoal-200"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-600">Last Activity</span>
                <span className="font-medium">
                  {metrics.lastActivityDate
                    ? formatDistanceToNow(new Date(metrics.lastActivityDate), { addSuffix: true })
                    : 'No recent activity'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-charcoal-600">Status</span>
                <Badge className={metrics.activeJobOrders > 0 ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'}>
                  {metrics.activeJobOrders > 0 ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {metrics.fillRate >= 50 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : metrics.fillRate >= 25 ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">
                  Fill rate is {metrics.fillRate >= 50 ? 'excellent' : metrics.fillRate >= 25 ? 'moderate' : 'needs improvement'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {metrics.averageFillTime && metrics.averageFillTime <= 30 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                )}
                <span className="text-sm">
                  Average fill time {metrics.averageFillTime && metrics.averageFillTime <= 30 ? 'is within target' : 'could be improved'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Data State */}
      {(!performance || metrics.totalJobOrders === 0) && (
        <Card className="bg-charcoal-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900">No Performance Data Yet</h3>
              <p className="text-charcoal-500 mt-2">
                Performance metrics will appear here once {vendorName} has job orders and submissions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
