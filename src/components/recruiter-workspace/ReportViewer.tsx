'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import {
  Download,
  Mail,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  FileBarChart,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReportViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

interface MetricCardProps {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
}

function MetricCard({ label, value, change, changeLabel }: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <TrendingUp className="w-4 h-4 text-success-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-error-500" />
    return <Minus className="w-4 h-4 text-charcoal-400" />
  }

  const getTrendColor = () => {
    if (change === undefined) return ''
    if (change > 0) return 'text-success-500'
    if (change < 0) return 'text-error-500'
    return 'text-charcoal-400'
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-charcoal-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-charcoal-900">{value}</p>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change}%</span>
            {changeLabel && <span className="text-charcoal-400">vs {changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface DataTableProps {
  columns: string[]
  rows: (string | number)[][]
}

function DataTable({ columns, rows }: DataTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-charcoal-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left text-sm font-medium text-charcoal-600">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-sm text-charcoal-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ReportViewer({ open, onOpenChange, reportId }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState('summary')

  const { data: report, isLoading } = trpc.reports.getById.useQuery(
    { id: reportId },
    { enabled: open && !!reportId }
  )

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Downloading report as ${format.toUpperCase()}...`)
    // In real implementation, this would trigger a download
  }

  const handleEmail = () => {
    toast.success('Email dialog will open')
    // In real implementation, this would open an email compose dialog
  }

  const handlePrint = () => {
    window.print()
  }

  if (!reportId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <FileBarChart className="w-5 h-5 text-charcoal-600" />
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <span className="capitalize">
                  {report?.report_type.replace('_', ' ')} Report
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload('excel')}>
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : report ? (
          <div className="space-y-6 py-4">
            {/* Report Period */}
            <div className="flex items-center gap-2 text-sm text-charcoal-500">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(report.start_date).toLocaleDateString()} -{' '}
                {new Date(report.end_date).toLocaleDateString()}
              </span>
              <Badge variant="outline" className="ml-2">
                {report.period}
              </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {report.report_type === 'performance_summary' && (
                    <>
                      <MetricCard
                        label="Submissions"
                        value={report.data?.submissions || 0}
                        change={report.comparison?.submissions_change}
                        changeLabel="last period"
                      />
                      <MetricCard
                        label="Interviews"
                        value={report.data?.interviews || 0}
                        change={report.comparison?.interviews_change}
                        changeLabel="last period"
                      />
                      <MetricCard
                        label="Placements"
                        value={report.data?.placements || 0}
                        change={report.comparison?.placements_change}
                        changeLabel="last period"
                      />
                      <MetricCard
                        label="Revenue"
                        value={`$${(report.data?.revenue || 0).toLocaleString()}`}
                        change={report.comparison?.revenue_change}
                        changeLabel="last period"
                      />
                    </>
                  )}
                  {report.report_type === 'activity_report' && (
                    <>
                      <MetricCard label="Total Activities" value={report.data?.total_activities || 0} />
                      <MetricCard label="Calls" value={report.data?.calls || 0} />
                      <MetricCard label="Emails" value={report.data?.emails || 0} />
                      <MetricCard label="Meetings" value={report.data?.meetings || 0} />
                    </>
                  )}
                  {report.report_type === 'quality_metrics' && (
                    <>
                      <MetricCard label="Submission Rate" value={`${report.data?.submission_rate || 0}%`} />
                      <MetricCard label="Interview Rate" value={`${report.data?.interview_rate || 0}%`} />
                      <MetricCard label="Offer Rate" value={`${report.data?.offer_rate || 0}%`} />
                      <MetricCard label="Fill Rate" value={`${report.data?.fill_rate || 0}%`} />
                    </>
                  )}
                </div>

                {/* Summary Text */}
                {report.data?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Executive Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-charcoal-600">{report.data.summary}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-4 space-y-6">
                {/* Detailed Data Tables */}
                {report.data?.by_account && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">By Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Account', 'Submissions', 'Interviews', 'Placements', 'Revenue']}
                        rows={report.data.by_account.map((a: {
                          name: string
                          submissions: number
                          interviews: number
                          placements: number
                          revenue: number
                        }) => [
                          a.name,
                          a.submissions,
                          a.interviews,
                          a.placements,
                          `$${a.revenue.toLocaleString()}`,
                        ])}
                      />
                    </CardContent>
                  </Card>
                )}

                {report.data?.by_job && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">By Job</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Job Title', 'Account', 'Submissions', 'Status']}
                        rows={report.data.by_job.map((j: {
                          title: string
                          account: string
                          submissions: number
                          status: string
                        }) => [j.title, j.account, j.submissions, j.status])}
                      />
                    </CardContent>
                  </Card>
                )}

                {report.data?.activities_by_type && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activities by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Type', 'Count', 'Avg Duration', 'Conversion']}
                        rows={report.data.activities_by_type.map((a: {
                          type: string
                          count: number
                          avg_duration: string
                          conversion: string
                        }) => [a.type, a.count, a.avg_duration, a.conversion])}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trends" className="mt-4 space-y-6">
                {/* Placeholder for charts - in real implementation would use a charting library */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-charcoal-50 rounded-lg">
                      <p className="text-charcoal-400">
                        Chart visualization would appear here
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {report.data?.weekly_trend && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Weekly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Week', 'Submissions', 'Interviews', 'Placements']}
                        rows={report.data.weekly_trend.map((w: {
                          week: string
                          submissions: number
                          interviews: number
                          placements: number
                        }) => [w.week, w.submissions, w.interviews, w.placements])}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileBarChart className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-600">Report not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
