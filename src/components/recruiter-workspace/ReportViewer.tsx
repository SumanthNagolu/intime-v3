'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  DollarSign,
  Users,
  Briefcase,
  Target,
  Activity,
  Building2,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import * as XLSX from 'xlsx'

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
  status?: 'good' | 'warning' | 'poor'
  icon?: React.ReactNode
}

function MetricCard({ label, value, change, changeLabel, status, icon }: MetricCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'border-success-200 bg-success-50/50'
      case 'warning': return 'border-amber-200 bg-amber-50/50'
      case 'poor': return 'border-error-200 bg-error-50/50'
      default: return ''
    }
  }

  return (
    <Card className={cn('transition-all', getStatusColor())}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-charcoal-900">{value}</p>
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 mt-2 text-xs',
                change > 0 ? 'text-success-600' : change < 0 ? 'text-error-600' : 'text-charcoal-500'
              )}>
                {change > 0 ? <TrendingUp className="w-3 h-3" /> : change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                <span>{change > 0 ? '+' : ''}{change}%</span>
                {changeLabel && <span className="text-charcoal-400">vs {changeLabel}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-charcoal-100 rounded-lg">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface DataTableProps {
  columns: string[]
  rows: (string | number)[][]
}

function DataTable({ columns, rows }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-charcoal-500">
        No data available
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-charcoal-50">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-medium text-charcoal-600 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-charcoal-50/50 transition-colors">
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

function QualityMetricRow({ metric }: { metric: { name: string; value: number; target: number; unit: string; status: string; description: string } }) {
  const getStatusIcon = () => {
    switch (metric.status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'poor': return <XCircle className="w-4 h-4 text-error-500" />
      default: return null
    }
  }

  const progress = metric.unit === '%'
    ? Math.min(100, (metric.value / metric.target) * 100)
    : Math.min(100, metric.value <= metric.target ? 100 : (metric.target / metric.value) * 100)

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-b-0">
      <div className="w-32 flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-sm font-medium text-charcoal-900">{metric.name}</span>
      </div>
      <div className="flex-1">
        <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              metric.status === 'good' ? 'bg-success-500' :
              metric.status === 'warning' ? 'bg-amber-500' : 'bg-error-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-charcoal-500 mt-1">{metric.description}</p>
      </div>
      <div className="text-right w-24">
        <p className="text-sm font-bold text-charcoal-900">{metric.value}{metric.unit}</p>
        <p className="text-xs text-charcoal-500">Target: {metric.target}{metric.unit}</p>
      </div>
    </div>
  )
}

export function ReportViewer({ open, onOpenChange, reportId }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState('summary')

  const { data: report, isLoading } = trpc.reports.getById.useQuery(
    { id: reportId },
    { enabled: open && !!reportId }
  )

  const reportData = report?.report_data as {
    data?: Record<string, unknown>
    report_type?: string
    period?: string
    period_label?: string
  } | null

  const handleDownload = (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData?.data) {
      toast.error('No report data to export')
      return
    }

    if (format === 'pdf') {
      window.print()
      toast.success('Print dialog opened')
      return
    }

    const filename = `${report?.report_type}-${report?.period}-${new Date().toISOString().split('T')[0]}`

    if (format === 'excel') {
      const wb = XLSX.utils.book_new()
      const data = reportData.data

      // Export summary
      if (data.summary && typeof data.summary === 'object') {
        const summaryRows = Object.entries(data.summary as Record<string, unknown>).map(([key, value]) => ({
          Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          Value: value,
        }))
        const summaryWs = XLSX.utils.json_to_sheet(summaryRows)
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')
      }

      // Export by account if available
      if (data.byAccount && Array.isArray(data.byAccount)) {
        const accountWs = XLSX.utils.json_to_sheet(data.byAccount as object[])
        XLSX.utils.book_append_sheet(wb, accountWs, 'By Account')
      }

      // Export placements if available
      if (data.placements && Array.isArray(data.placements)) {
        const placementsWs = XLSX.utils.json_to_sheet(data.placements as object[])
        XLSX.utils.book_append_sheet(wb, placementsWs, 'Placements')
      }

      // Export metrics if available
      if (data.metrics && Array.isArray(data.metrics)) {
        const metricsWs = XLSX.utils.json_to_sheet(data.metrics as object[])
        XLSX.utils.book_append_sheet(wb, metricsWs, 'Quality Metrics')
      }

      XLSX.writeFile(wb, `${filename}.xlsx`)
      toast.success('Report exported to Excel')
    } else if (format === 'csv') {
      const data = reportData.data
      let csvContent = ''

      if (data.summary && typeof data.summary === 'object') {
        csvContent = 'Metric,Value\n'
        Object.entries(data.summary as Record<string, unknown>).forEach(([key, value]) => {
          csvContent += `"${key.replace(/([A-Z])/g, ' $1')}",${value}\n`
        })
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.csv`
      link.click()
      toast.success('Report exported to CSV')
    }
  }

  const handleEmail = () => {
    toast.info('Email functionality coming soon')
  }

  if (!reportId) return null

  const getReportIcon = () => {
    switch (report?.report_type) {
      case 'performance_summary': return <TrendingUp className="w-5 h-5 text-charcoal-600" />
      case 'revenue_commission': return <DollarSign className="w-5 h-5 text-charcoal-600" />
      case 'activity_report': return <Activity className="w-5 h-5 text-charcoal-600" />
      case 'quality_metrics': return <Target className="w-5 h-5 text-charcoal-600" />
      case 'account_portfolio': return <Building2 className="w-5 h-5 text-charcoal-600" />
      case 'pipeline_analysis': return <BarChart3 className="w-5 h-5 text-charcoal-600" />
      default: return <FileBarChart className="w-5 h-5 text-charcoal-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {getReportIcon()}
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <span className="capitalize">
                  {report?.report_type?.replace(/_/g, ' ')} Report
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload('excel')}>
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Mail className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
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
        ) : report && reportData ? (
          <div className="space-y-6 py-4">
            {/* Report Period */}
            <div className="flex items-center gap-2 text-sm text-charcoal-500">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(report.start_date).toLocaleDateString()} -{' '}
                {new Date(report.end_date).toLocaleDateString()}
              </span>
              <Badge variant="outline" className="ml-2 capitalize">
                {report.period?.replace(/_/g, ' ')}
              </Badge>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                {!!reportData.data?.chartData && <TabsTrigger value="trends">Trends</TabsTrigger>}
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="mt-4 space-y-6">
                {/* Performance Summary */}
                {report.report_type === 'performance_summary' && !!reportData.data?.summary && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <MetricCard
                        label="Placements"
                        value={Number((reportData.data.summary as Record<string, number>).placements ?? 0)}
                        change={Number((reportData.data.comparison as Record<string, number>)?.placements_change ?? 0)}
                        changeLabel="last period"
                        icon={<Briefcase className="w-4 h-4 text-charcoal-600" />}
                      />
                      <MetricCard
                        label="Revenue"
                        value={`$${(Number((reportData.data.summary as Record<string, number>).revenue ?? 0) / 1000).toFixed(1)}k`}
                        change={Number((reportData.data.comparison as Record<string, number>)?.revenue_change ?? 0)}
                        changeLabel="last period"
                        icon={<DollarSign className="w-4 h-4 text-charcoal-600" />}
                      />
                      <MetricCard
                        label="Submissions"
                        value={Number((reportData.data.summary as Record<string, number>).submissions ?? 0)}
                        change={Number((reportData.data.comparison as Record<string, number>)?.submissions_change ?? 0)}
                        changeLabel="last period"
                        icon={<FileBarChart className="w-4 h-4 text-charcoal-600" />}
                      />
                      <MetricCard
                        label="Interviews"
                        value={Number((reportData.data.summary as Record<string, number>).interviews ?? 0)}
                        change={Number((reportData.data.comparison as Record<string, number>)?.interviews_change ?? 0)}
                        changeLabel="last period"
                        icon={<Users className="w-4 h-4 text-charcoal-600" />}
                      />
                      <MetricCard
                        label="Candidates"
                        value={Number((reportData.data.summary as Record<string, number>).candidatesSourced ?? 0)}
                        icon={<Target className="w-4 h-4 text-charcoal-600" />}
                      />
                    </div>

                    {/* Quality Metrics */}
                    {!!reportData.data.qualityMetrics && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Quality Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                              <p className="text-2xl font-bold text-charcoal-900">
                                {Number((reportData.data.qualityMetrics as Record<string, number>).submissionToInterviewRate ?? 0)}%
                              </p>
                              <p className="text-xs text-charcoal-500">Submission Quality</p>
                            </div>
                            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                              <p className="text-2xl font-bold text-charcoal-900">
                                {Number((reportData.data.qualityMetrics as Record<string, number>).interviewToOfferRate ?? 0)}%
                              </p>
                              <p className="text-xs text-charcoal-500">Interview to Offer</p>
                            </div>
                            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                              <p className="text-2xl font-bold text-charcoal-900">
                                {Number((reportData.data.qualityMetrics as Record<string, number>).offerAcceptanceRate ?? 0)}%
                              </p>
                              <p className="text-xs text-charcoal-500">Offer Acceptance</p>
                            </div>
                            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
                              <p className="text-2xl font-bold text-charcoal-900">
                                {Number((reportData.data.qualityMetrics as Record<string, number>).fillRate ?? 0)}%
                              </p>
                              <p className="text-xs text-charcoal-500">Fill Rate</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Revenue & Commission Summary */}
                {report.report_type === 'revenue_commission' && !!reportData.data?.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      label="Total Revenue"
                      value={`$${(Number((reportData.data.summary as Record<string, number>).totalRevenue ?? 0) / 1000).toFixed(1)}k`}
                      change={Number((reportData.data.comparison as Record<string, number>)?.revenue_change ?? 0)}
                      changeLabel="last period"
                      icon={<DollarSign className="w-4 h-4 text-charcoal-600" />}
                    />
                    <MetricCard
                      label="Gross Profit"
                      value={`$${(Number((reportData.data.summary as Record<string, number>).totalGrossProfit ?? 0) / 1000).toFixed(1)}k`}
                      icon={<TrendingUp className="w-4 h-4 text-charcoal-600" />}
                    />
                    <MetricCard
                      label="Commission"
                      value={`$${(Number((reportData.data.summary as Record<string, number>).totalCommission ?? 0) / 1000).toFixed(1)}k`}
                      change={Number((reportData.data.comparison as Record<string, number>)?.commission_change ?? 0)}
                      changeLabel="last period"
                      icon={<DollarSign className="w-4 h-4 text-success-600" />}
                    />
                    <MetricCard
                      label="Placements"
                      value={Number((reportData.data.summary as Record<string, number>).placementCount ?? 0)}
                      icon={<Briefcase className="w-4 h-4 text-charcoal-600" />}
                    />
                  </div>
                )}

                {/* Activity Report Summary */}
                {report.report_type === 'activity_report' && !!reportData.data?.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      label="Total Activities"
                      value={Number((reportData.data.summary as Record<string, number>).total ?? 0)}
                      change={Number((reportData.data.comparison as Record<string, number>)?.total_change ?? 0)}
                      changeLabel="last period"
                      icon={<Activity className="w-4 h-4 text-charcoal-600" />}
                    />
                    <MetricCard
                      label="Completion Rate"
                      value={`${Number((reportData.data.summary as Record<string, number>).completionRate ?? 0)}%`}
                      icon={<Target className="w-4 h-4 text-charcoal-600" />}
                    />
                    <MetricCard
                      label="Daily Average"
                      value={Number((reportData.data.summary as Record<string, number>).dailyAverage ?? 0)}
                      icon={<BarChart3 className="w-4 h-4 text-charcoal-600" />}
                    />
                    <MetricCard
                      label="Calls"
                      value={Number((reportData.data.summary as Record<string, number>).calls ?? 0)}
                      icon={<Users className="w-4 h-4 text-charcoal-600" />}
                    />
                  </div>
                )}

                {/* Quality Metrics Summary */}
                {report.report_type === 'quality_metrics' && !!reportData.data?.summary && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="col-span-2 md:col-span-1">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Overall Quality Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center">
                            <div className="relative w-32 h-32">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  stroke="#E5E7EB"
                                  strokeWidth="12"
                                  fill="none"
                                />
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  stroke={
                                    Number((reportData.data.summary as Record<string, number>).qualityScore ?? 0) >= 80 ? '#10B981' :
                                    Number((reportData.data.summary as Record<string, number>).qualityScore ?? 0) >= 60 ? '#F59E0B' : '#EF4444'
                                  }
                                  strokeWidth="12"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray={`${(Number((reportData.data.summary as Record<string, number>).qualityScore ?? 0) / 100) * 352} 352`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-charcoal-900">
                                  {Number((reportData.data.summary as Record<string, number>).qualityScore ?? 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-4">
                        <MetricCard
                          label="Time to Submit"
                          value={`${Number((reportData.data.summary as Record<string, number>).timeToSubmit ?? 0)}h`}
                          icon={<Activity className="w-4 h-4 text-charcoal-600" />}
                        />
                        <MetricCard
                          label="Time to Fill"
                          value={`${Number((reportData.data.summary as Record<string, number>).timeToFill ?? 0)}d`}
                          icon={<BarChart3 className="w-4 h-4 text-charcoal-600" />}
                        />
                        <MetricCard
                          label="Submission Quality"
                          value={`${Number((reportData.data.summary as Record<string, number>).submissionToInterviewRate ?? 0)}%`}
                          icon={<Target className="w-4 h-4 text-charcoal-600" />}
                        />
                        <MetricCard
                          label="Retention Rate"
                          value={`${Number((reportData.data.summary as Record<string, number>).retentionRate ?? 0)}%`}
                          icon={<Users className="w-4 h-4 text-charcoal-600" />}
                        />
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    {!!reportData.data.metrics && Array.isArray(reportData.data.metrics) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Detailed Quality Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(reportData.data.metrics as Array<{ name: string; value: number; target: number; unit: string; status: string; description: string }>).map((metric, i) => (
                            <QualityMetricRow key={i} metric={metric} />
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Account Portfolio Summary */}
                {report.report_type === 'account_portfolio' && !!reportData.data?.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                      label="Total Accounts"
                      value={Number((reportData.data.summary as Record<string, number>).totalAccounts ?? 0)}
                      icon={<Building2 className="w-4 h-4 text-charcoal-600" />}
                    />
                    <MetricCard
                      label="Healthy"
                      value={Number((reportData.data.summary as Record<string, number>).healthyAccounts ?? 0)}
                      status="good"
                      icon={<Target className="w-4 h-4 text-success-600" />}
                    />
                    <MetricCard
                      label="At Risk"
                      value={Number((reportData.data.summary as Record<string, number>).atRiskAccounts ?? 0)}
                      status="warning"
                      icon={<Target className="w-4 h-4 text-amber-600" />}
                    />
                    <MetricCard
                      label="Period Revenue"
                      value={`$${(Number((reportData.data.summary as Record<string, number>).totalPeriodRevenue ?? 0) / 1000).toFixed(1)}k`}
                      icon={<DollarSign className="w-4 h-4 text-charcoal-600" />}
                    />
                  </div>
                )}

                {/* Pipeline Analysis Summary */}
                {report.report_type === 'pipeline_analysis' && !!reportData.data?.funnel && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Pipeline Funnel</CardTitle>
                        <CardDescription>
                          Overall conversion: {(reportData.data.funnel as { conversionRates: { overallConversion: number } }).conversionRates.overallConversion}%
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {((reportData.data.funnel as { stages: Array<{ name: string; count: number; color: string }> }).stages).map((stage, index) => {
                            const stages = (reportData.data?.funnel as { stages: Array<{ count: number }> }).stages
                            const maxCount = Math.max(...stages.map(s => s.count))
                            const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0

                            return (
                              <div key={stage.name} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-charcoal-700">{stage.name}</span>
                                  <span className="font-bold text-charcoal-900">{stage.count}</span>
                                </div>
                                <div className="h-6 bg-charcoal-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${width}%`, backgroundColor: stage.color }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Velocity */}
                    {!!reportData.data.velocity && (
                      <div className="grid grid-cols-4 gap-4">
                        <MetricCard
                          label="Candidates/Day"
                          value={Number((reportData.data.velocity as Record<string, number>).candidatesPerDay ?? 0)}
                          icon={<Users className="w-4 h-4 text-charcoal-600" />}
                        />
                        <MetricCard
                          label="Submissions/Day"
                          value={Number((reportData.data.velocity as Record<string, number>).submissionsPerDay ?? 0)}
                          icon={<FileBarChart className="w-4 h-4 text-charcoal-600" />}
                        />
                        <MetricCard
                          label="Interviews/Week"
                          value={Number((reportData.data.velocity as Record<string, number>).interviewsPerWeek ?? 0)}
                          icon={<Activity className="w-4 h-4 text-charcoal-600" />}
                        />
                        <MetricCard
                          label="Placements/Month"
                          value={Number((reportData.data.velocity as Record<string, number>).placementsPerMonth ?? 0)}
                          icon={<Briefcase className="w-4 h-4 text-charcoal-600" />}
                        />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-4 space-y-6">
                {/* By Account Table */}
                {!!reportData.data?.byAccount && Array.isArray(reportData.data.byAccount) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">By Account</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Account', 'Submissions', 'Interviews', 'Placements']}
                        rows={(reportData.data.byAccount as Array<{ name: string; submissions: number; interviews: number; placements: number }>).map(a => [
                          a.name,
                          a.submissions,
                          a.interviews,
                          a.placements,
                        ])}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Placements Table */}
                {!!reportData.data?.placements && Array.isArray(reportData.data.placements) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Placements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Job Title', 'Account', 'Type', 'Bill Rate', 'Revenue', 'Margin']}
                        rows={(reportData.data.placements as Array<{ jobTitle: string; accountName: string; type: string; billRate: number; revenue: number; margin: number }>).map(p => [
                          p.jobTitle,
                          p.accountName,
                          p.type || '-',
                          `$${p.billRate || 0}/hr`,
                          `$${(p.revenue || 0).toLocaleString()}`,
                          `${p.margin || 0}%`,
                        ])}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Activity By Type */}
                {!!reportData.data?.byType && Array.isArray(reportData.data.byType) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Activities by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Type', 'Total', 'Completed', 'Completion Rate']}
                        rows={(reportData.data.byType as Array<{ type: string; total: number; completed: number; completionRate: number }>).map(a => [
                          a.type.charAt(0).toUpperCase() + a.type.slice(1).replace('_', ' '),
                          a.total,
                          a.completed,
                          `${a.completionRate}%`,
                        ])}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Account Portfolio Details */}
                {!!reportData.data?.accounts && Array.isArray(reportData.data.accounts) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Account Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Account', 'Status', 'Active Jobs', 'Period Revenue', 'Health']}
                        rows={(reportData.data.accounts as Array<{ name: string; status: string; activeJobs: number; periodRevenue: number; healthStatus: string }>).map(a => [
                          a.name,
                          a.status,
                          a.activeJobs,
                          `$${(a.periodRevenue || 0).toLocaleString()}`,
                          a.healthStatus,
                        ])}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Pipeline Jobs */}
                {!!reportData.data?.jobs && typeof reportData.data.jobs === 'object' && !!(reportData.data.jobs as { details: Array<{ title: string; account: string; status: string; submissions: number; daysOpen: number }> }).details && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={['Job Title', 'Account', 'Status', 'Submissions', 'Days Open']}
                        rows={((reportData.data.jobs as { details: Array<{ title: string; account: string; status: string; submissions: number; daysOpen: number }> }).details).map(j => [
                          j.title,
                          j.account,
                          j.status,
                          j.submissions,
                          j.daysOpen,
                        ])}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Bottlenecks */}
                {!!reportData.data?.bottlenecks && Array.isArray(reportData.data.bottlenecks) && (reportData.data.bottlenecks as Array<unknown>).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identified Bottlenecks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(reportData.data.bottlenecks as Array<{ stage: string; issue: string; severity: 'high' | 'medium' | 'low' }>).map((b, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg border',
                              b.severity === 'high' ? 'bg-error-50 border-error-200' :
                              b.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                            )}
                          >
                            <AlertCircle className={cn(
                              'w-4 h-4 mt-0.5',
                              b.severity === 'high' ? 'text-error-500' :
                              b.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                            )} />
                            <div>
                              <p className="font-medium text-sm text-charcoal-900">{b.stage}</p>
                              <p className="text-xs text-charcoal-600">{b.issue}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Trends Tab */}
              {!!reportData.data?.chartData && (
                <TabsContent value="trends" className="mt-4 space-y-6">
                  {(reportData.data.chartData as { submissionsByDay?: Array<{ date: string; count: number }> }).submissionsByDay && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Submissions Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={((reportData.data.chartData as { submissionsByDay: Array<{ date: string; count: number }> }).submissionsByDay).map(d => ({
                              ...d,
                              label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            }))}>
                              <defs>
                                <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} />
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#submissionsGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(reportData.data.chartData as { byDay?: Array<{ date: string; count: number }> }).byDay && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Activities Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={((reportData.data.chartData as { byDay: Array<{ date: string; count: number }> }).byDay).map(d => ({
                              ...d,
                              label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6B7280' }} />
                              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}
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
