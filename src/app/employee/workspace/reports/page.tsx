'use client'

import { useState } from 'react'
import { DashboardShell, DashboardSection } from '@/components/dashboard/DashboardShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { trpc } from '@/lib/trpc/client'
import { ReportViewer } from '@/components/recruiter-workspace'
import {
  FileBarChart,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  Building2,
  BarChart3,
  Download,
  Mail,
  Trash2,
  Eye,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  FileSpreadsheet,
  FileText,
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

// ============================================
// CONSTANTS
// ============================================

const REPORT_ICONS: Record<string, React.ReactNode> = {
  performance_summary: <TrendingUp className="w-5 h-5 text-charcoal-600" />,
  revenue_commission: <DollarSign className="w-5 h-5 text-charcoal-600" />,
  activity_report: <Activity className="w-5 h-5 text-charcoal-600" />,
  quality_metrics: <Target className="w-5 h-5 text-charcoal-600" />,
  account_portfolio: <Building2 className="w-5 h-5 text-charcoal-600" />,
  pipeline_analysis: <BarChart3 className="w-5 h-5 text-charcoal-600" />,
}

const PERIODS = [
  { value: 'this_sprint', label: 'This Sprint' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'last_quarter', label: 'Last Quarter' },
]


// ============================================
// PERFORMANCE CHANGE CARD - Analytics focused
// ============================================

interface PerformanceChangeCardProps {
  title: string
  current: string | number
  change: number
  vsTeam: number
  isLoading?: boolean
}

function PerformanceChangeCard({ title, current, change, vsTeam, isLoading }: PerformanceChangeCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-6 w-12 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-elevation-md transition-all">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-xl font-bold text-charcoal-900 mb-2">{current}</p>
        <div className="flex flex-col gap-1">
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium',
            change > 0 ? 'text-success-600' : change < 0 ? 'text-error-600' : 'text-charcoal-500'
          )}>
            {change > 0 ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {change > 0 ? '+' : ''}{change}% vs last period
          </span>
          <span className={cn(
            'flex items-center gap-1 text-xs',
            vsTeam > 0 ? 'text-success-600' : vsTeam < 0 ? 'text-error-600' : 'text-charcoal-500'
          )}>
            {vsTeam > 0 ? '+' : ''}{vsTeam}% vs team avg
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// QUALITY METRIC CARD - Analytics focused
// ============================================

interface QualityMetricCardProps {
  title: string
  value: number
  target: number
  unit: string
  description: string
  isLoading?: boolean
}

function QualityMetricCard({ title, value, target, unit, description, isLoading }: QualityMetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-6 w-16 mb-1" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  const percentage = Math.min(100, (value / target) * 100)
  const status = value >= target ? 'good' : value >= target * 0.7 ? 'warning' : 'poor'
  const statusColors = {
    good: { bar: 'bg-success-500', text: 'text-success-600' },
    warning: { bar: 'bg-amber-500', text: 'text-amber-600' },
    poor: { bar: 'bg-error-500', text: 'text-error-600' },
  }

  return (
    <Card className="hover:shadow-elevation-md transition-all">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className={cn('text-xl font-bold', statusColors[status].text)}>{value}{unit}</span>
          <span className="text-xs text-charcoal-400">/ {target}{unit}</span>
        </div>
        <div className="h-1.5 bg-charcoal-100 rounded-full overflow-hidden mb-2">
          <div
            className={cn('h-full rounded-full transition-all duration-500', statusColors[status].bar)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-charcoal-500">{description}</p>
      </CardContent>
    </Card>
  )
}

// ============================================
// TEAM COMPARISON ITEM - Analytics focused
// ============================================

interface TeamComparisonItemProps {
  label: string
  yours: string | number
  teamAvg: string | number
  vsTeam: number
  isLoading?: boolean
}

function TeamComparisonItem({ label, yours, teamAvg, vsTeam, isLoading }: TeamComparisonItemProps) {
  if (isLoading) {
    return (
      <div className="text-center">
        <Skeleton className="h-3 w-20 mx-auto mb-2" />
        <Skeleton className="h-6 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-xs text-charcoal-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-charcoal-900">{yours}</p>
      <p className="text-xs text-charcoal-400 mb-1">Team avg: {teamAvg}</p>
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          vsTeam > 0 ? 'border-success-300 text-success-600 bg-success-50' :
          vsTeam < 0 ? 'border-error-300 text-error-600 bg-error-50' :
          'border-charcoal-300 text-charcoal-600'
        )}
      >
        {vsTeam > 0 ? '+' : ''}{vsTeam}%
      </Badge>
    </div>
  )
}

// ============================================
// ALERT CARD COMPONENT
// ============================================

interface AlertCardProps {
  type: 'warning' | 'error' | 'info'
  title: string
  description: string
  action?: string
}

function AlertCard({ type, title, description, action }: AlertCardProps) {
  const config = {
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bg: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-600',
      text: 'text-amber-800',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4" />,
      bg: 'bg-error-50 border-error-200',
      iconBg: 'bg-error-100 text-error-600',
      text: 'text-error-800',
    },
    info: {
      icon: <Info className="w-4 h-4" />,
      bg: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-600',
      text: 'text-blue-800',
    },
  }[type]

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', config.bg)}>
      <div className={cn('p-1.5 rounded-full', config.iconBg)}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', config.text)}>{title}</p>
        <p className="text-xs text-charcoal-600 mt-0.5">{description}</p>
        {action && (
          <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
            {action}
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// TREND CHART COMPONENT
// ============================================

interface TrendChartProps {
  data: Array<{ date?: string; week?: string; count: number; label?: string }>
  title: string
  color?: string
  isLoading?: boolean
}

function TrendChart({ data, title, color = '#10B981', isLoading }: TrendChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  const formattedData = data.map(d => ({
    ...d,
    label: d.label || (d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.week ? `Week of ${new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''),
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// FUNNEL CHART COMPONENT
// ============================================

interface FunnelChartProps {
  stages: Array<{ name: string; count: number; color: string }>
  conversionRates: Record<string, number>
  isLoading?: boolean
}

function PipelineFunnel({ stages, conversionRates, isLoading }: FunnelChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pipeline Funnel</CardTitle>
        <CardDescription>Overall conversion: {conversionRates.overallConversion}%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const maxCount = Math.max(...stages.map(s => s.count))
            const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
            const conversionKey = index === 0 ? null :
              index === 1 ? 'submissionRate' :
              index === 2 ? 'interviewRate' :
              index === 3 ? 'offerRate' :
              'placementRate'

            return (
              <div key={stage.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-charcoal-700">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">{stage.count}</span>
                    {conversionKey && conversionRates[conversionKey] !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {conversionRates[conversionKey]}%
                      </Badge>
                    )}
                  </div>
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
  )
}

// ============================================
// ACTIVITY BREAKDOWN CHART
// ============================================

interface ActivityBreakdownProps {
  breakdown: Array<{ type: string; total: number; completed: number; completionRate: number }>
  isLoading?: boolean
}

function ActivityBreakdownChart({ breakdown, isLoading }: ActivityBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  const formattedData = breakdown.map(b => ({
    ...b,
    name: b.type.charAt(0).toUpperCase() + b.type.slice(1).replace('_', ' '),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Activity Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="total" fill="#3B82F6" name="Total" radius={[0, 4, 4, 0]} />
              <Bar dataKey="completed" fill="#10B981" name="Completed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// GENERATE REPORT MODAL
// ============================================

interface GenerateReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTemplate: string
}

function GenerateReportModal({ open, onOpenChange, selectedTemplate }: GenerateReportModalProps) {
  const [period, setPeriod] = useState('this_month')
  const [compareToPrevious, setCompareToPrevious] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)

  const utils = trpc.useUtils()
  const generateMutation = trpc.reports.generate.useMutation({
    onSuccess: () => {
      toast.success('Report generated successfully')
      utils.reports.getSaved.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error('Failed to generate report', { description: error.message })
    },
  })

  const { data: templates } = trpc.reports.getTemplates.useQuery()
  const template = templates?.find(t => t.id === selectedTemplate)

  const handleGenerate = () => {
    generateMutation.mutate({
      reportType: selectedTemplate as 'performance_summary' | 'revenue_commission' | 'activity_report' | 'quality_metrics' | 'account_portfolio' | 'pipeline_analysis',
      period: period as 'this_sprint' | 'last_sprint' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'ytd' | 'custom',
      compareToPreviousPeriod: compareToPrevious,
      includeCharts,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {REPORT_ICONS[selectedTemplate]}
            Generate {template?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compare"
                checked={compareToPrevious}
                onCheckedChange={(c) => setCompareToPrevious(c as boolean)}
              />
              <Label htmlFor="compare" className="cursor-pointer text-sm">
                Compare to previous period
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="charts"
                checked={includeCharts}
                onCheckedChange={(c) => setIncludeCharts(c as boolean)}
              />
              <Label htmlFor="charts" className="cursor-pointer text-sm">
                Include charts & visualizations
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// EXPORT FUNCTIONS
// ============================================

function exportToExcel(data: Record<string, unknown>, filename: string) {
  const wb = XLSX.utils.book_new()

  // Convert summary to worksheet
  if (data.current && typeof data.current === 'object') {
    const summaryData = Object.entries(data.current as Record<string, unknown>).map(([key, value]) => ({
      Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      Value: value,
    }))
    const summaryWs = XLSX.utils.json_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')
  }

  // Convert trends if available
  if (data.trends && Array.isArray(data.trends)) {
    const trendsWs = XLSX.utils.json_to_sheet(data.trends as object[])
    XLSX.utils.book_append_sheet(wb, trendsWs, 'Trends')
  }

  XLSX.writeFile(wb, `${filename}.xlsx`)
  toast.success('Report exported to Excel')
}

function exportToCSV(data: Record<string, unknown>, filename: string) {
  let csvContent = ''

  if (data.current && typeof data.current === 'object') {
    const entries = Object.entries(data.current as Record<string, unknown>)
    csvContent = 'Metric,Value\n'
    entries.forEach(([key, value]) => {
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

// ============================================
// MAIN REPORTS PAGE
// ============================================

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'this_sprint' | 'this_month' | 'this_quarter' | 'ytd' | 'last_month' | 'last_quarter'>('this_month')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showReportViewer, setShowReportViewer] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  const utils = trpc.useUtils()

  // Queries
  const { data: templates, isLoading: loadingTemplates } = trpc.reports.getTemplates.useQuery()
  const { data: savedReports, isLoading: loadingSaved } = trpc.reports.getSaved.useQuery({ limit: 10 })
  const { data: dashboard, isLoading: loadingDashboard, refetch: refetchDashboard } = trpc.reports.getLiveDashboard.useQuery(
    { period: selectedPeriod },
    { refetchInterval: 60000 } // Refresh every minute
  )
  const { data: trends, isLoading: loadingTrends } = trpc.reports.getPerformanceTrends.useQuery(
    { period: selectedPeriod, granularity: 'day' }
  )
  const { data: funnel, isLoading: loadingFunnel } = trpc.reports.getPipelineFunnel.useQuery(
    { period: selectedPeriod }
  )
  const { data: activityBreakdown, isLoading: loadingActivities } = trpc.reports.getActivityBreakdown.useQuery(
    { period: selectedPeriod }
  )

  const deleteMutation = trpc.reports.delete.useMutation({
    onSuccess: () => {
      toast.success('Report deleted')
      utils.reports.getSaved.invalidate()
    },
  })

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    setShowGenerateModal(true)
  }

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setShowReportViewer(true)
  }

  const handleExport = (format: 'excel' | 'csv') => {
    if (!dashboard) return

    const exportData = {
      current: dashboard.current,
      changes: dashboard.changes,
      vsTeam: dashboard.vsTeam,
      period: dashboard.period,
      trends: trends?.submissions,
    }

    const filename = `performance-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}`

    if (format === 'excel') {
      exportToExcel(exportData, filename)
    } else {
      exportToCSV(exportData, filename)
    }
  }

  return (
    <>
      <DashboardShell
        title="Performance Analytics"
        description="Track trends, compare against team, and generate detailed reports"
        actions={
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
            <Button variant="outline" size="icon" onClick={() => refetchDashboard()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => handleSelectTemplate('performance_summary')}>
              <FileBarChart className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Performance Analytics</TabsTrigger>
            <TabsTrigger value="reports">Generate Reports</TabsTrigger>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* PERFORMANCE ANALYTICS TAB */}
          {/* ============================================ */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Alerts Section - Important for actionable insights */}
            {dashboard?.alerts && dashboard.alerts.length > 0 && (
              <DashboardSection title="Attention Required">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dashboard.alerts.slice(0, 3).map((alert, i) => (
                    <AlertCard
                      key={i}
                      type={alert.type}
                      title={alert.title}
                      description={alert.description}
                      action={alert.action}
                    />
                  ))}
                </div>
              </DashboardSection>
            )}

            {/* Performance vs Period - Focused on CHANGES not raw counts */}
            <DashboardSection
              title="Performance vs Previous Period"
              action={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PerformanceChangeCard
                  title="Placements"
                  current={dashboard?.current.placements ?? 0}
                  change={dashboard?.changes.placements ?? 0}
                  vsTeam={dashboard?.vsTeam.placements ?? 0}
                  isLoading={loadingDashboard}
                />
                <PerformanceChangeCard
                  title="Revenue"
                  current={`$${((dashboard?.current.revenue ?? 0) / 1000).toFixed(1)}k`}
                  change={dashboard?.changes.revenue ?? 0}
                  vsTeam={dashboard?.vsTeam.revenue ?? 0}
                  isLoading={loadingDashboard}
                />
                <PerformanceChangeCard
                  title="Submissions"
                  current={dashboard?.current.submissions ?? 0}
                  change={dashboard?.changes.submissions ?? 0}
                  vsTeam={dashboard?.vsTeam.submissions ?? 0}
                  isLoading={loadingDashboard}
                />
                <PerformanceChangeCard
                  title="Interviews"
                  current={dashboard?.current.interviews ?? 0}
                  change={dashboard?.changes.interviews ?? 0}
                  vsTeam={dashboard?.vsTeam.interviews ?? 0}
                  isLoading={loadingDashboard}
                />
              </div>
            </DashboardSection>

            {/* Quality Metrics - Unique analytics value */}
            <DashboardSection title="Quality Metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QualityMetricCard
                  title="Submission Quality"
                  value={dashboard?.current.submissionToInterviewRate ?? 0}
                  target={70}
                  unit="%"
                  description="reach interview stage"
                  isLoading={loadingDashboard}
                />
                <QualityMetricCard
                  title="Interview to Offer"
                  value={dashboard?.current.interviewToOfferRate ?? 0}
                  target={40}
                  unit="%"
                  description="conversion rate"
                  isLoading={loadingDashboard}
                />
                <QualityMetricCard
                  title="Offer Acceptance"
                  value={dashboard?.current.offerAcceptanceRate ?? 0}
                  target={85}
                  unit="%"
                  description="offers accepted"
                  isLoading={loadingDashboard}
                />
                <QualityMetricCard
                  title="Fill Rate"
                  value={dashboard?.current.fillRate ?? 0}
                  target={50}
                  unit="%"
                  description="jobs filled"
                  isLoading={loadingDashboard}
                />
              </div>
            </DashboardSection>

            {/* Trend Charts - Core analytics value */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                data={trends?.submissions ?? []}
                title="Submissions Trend"
                color="#3B82F6"
                isLoading={loadingTrends}
              />
              <PipelineFunnel
                stages={funnel?.stages ?? []}
                conversionRates={funnel?.conversionRates ?? {}}
                isLoading={loadingFunnel}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart
                data={trends?.activities ?? []}
                title="Activities Completed"
                color="#10B981"
                isLoading={loadingTrends}
              />
              <ActivityBreakdownChart
                breakdown={activityBreakdown?.breakdown ?? []}
                isLoading={loadingActivities}
              />
            </div>

            {/* Team Comparison - Competitive analytics */}
            <DashboardSection title="Team Comparison">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <TeamComparisonItem
                      label="Placements"
                      yours={dashboard?.current.placements ?? 0}
                      teamAvg={dashboard?.teamAverage.placements ?? 0}
                      vsTeam={dashboard?.vsTeam.placements ?? 0}
                      isLoading={loadingDashboard}
                    />
                    <TeamComparisonItem
                      label="Revenue"
                      yours={`$${((dashboard?.current.revenue ?? 0) / 1000).toFixed(1)}k`}
                      teamAvg={`$${((dashboard?.teamAverage.revenue ?? 0) / 1000).toFixed(1)}k`}
                      vsTeam={dashboard?.vsTeam.revenue ?? 0}
                      isLoading={loadingDashboard}
                    />
                    <TeamComparisonItem
                      label="Submissions"
                      yours={dashboard?.current.submissions ?? 0}
                      teamAvg={dashboard?.teamAverage.submissions ?? 0}
                      vsTeam={dashboard?.vsTeam.submissions ?? 0}
                      isLoading={loadingDashboard}
                    />
                    <TeamComparisonItem
                      label="Interviews"
                      yours={dashboard?.current.interviews ?? 0}
                      teamAvg={dashboard?.teamAverage.interviews ?? 0}
                      vsTeam={dashboard?.vsTeam.interviews ?? 0}
                      isLoading={loadingDashboard}
                    />
                  </div>
                </CardContent>
              </Card>
            </DashboardSection>
          </TabsContent>

          {/* ============================================ */}
          {/* REPORT TEMPLATES TAB */}
          {/* ============================================ */}
          <TabsContent value="reports" className="space-y-6">
            <DashboardSection title="Generate New Report">
              {loadingTemplates ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-36" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates?.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:shadow-elevation-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-charcoal-100 rounded-lg group-hover:bg-charcoal-200 transition-colors">
                            {REPORT_ICONS[template.id] || <FileBarChart className="w-5 h-5 text-charcoal-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-charcoal-900 mb-1 flex items-center gap-2">
                              <span>{template.icon}</span>
                              {template.name}
                            </h3>
                            <p className="text-sm text-charcoal-500 line-clamp-2">
                              {template.description}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-2 p-0 h-auto text-charcoal-600 hover:text-charcoal-900"
                            >
                              Generate Report
                              <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </DashboardSection>
          </TabsContent>

          {/* ============================================ */}
          {/* SAVED REPORTS TAB */}
          {/* ============================================ */}
          <TabsContent value="saved" className="space-y-6">
            <DashboardSection title="Your Saved Reports">
              {loadingSaved ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : savedReports?.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileBarChart className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
                    <p className="text-charcoal-600 mb-4">No saved reports yet.</p>
                    <Button onClick={() => handleSelectTemplate('performance_summary')}>
                      Generate Your First Report
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    {savedReports?.map((report, index) => (
                      <div
                        key={report.id}
                        className={cn(
                          'flex items-center justify-between p-4 hover:bg-charcoal-50 transition-colors',
                          index !== savedReports.length - 1 && 'border-b'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-charcoal-100 rounded-lg">
                            {REPORT_ICONS[report.report_type] || <FileBarChart className="w-5 h-5 text-charcoal-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900 capitalize">
                              {report.report_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-charcoal-500 flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {new Date(report.start_date).toLocaleDateString()} -{' '}
                              {new Date(report.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {report.period.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-charcoal-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteMutation.mutate({ id: report.id })
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-error-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </DashboardSection>
          </TabsContent>
        </Tabs>
      </DashboardShell>

      <GenerateReportModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        selectedTemplate={selectedTemplate}
      />

      <ReportViewer
        open={showReportViewer}
        onOpenChange={setShowReportViewer}
        reportId={selectedReportId}
      />
    </>
  )
}
