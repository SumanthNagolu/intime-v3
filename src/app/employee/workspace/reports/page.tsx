'use client'

import { useState } from 'react'
import { DashboardShell, DashboardSection } from '@/components/dashboard/DashboardShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const REPORT_ICONS: Record<string, React.ReactNode> = {
  performance_summary: <TrendingUp className="w-8 h-8 text-charcoal-600" />,
  revenue_commission: <DollarSign className="w-8 h-8 text-charcoal-600" />,
  activity_report: <Activity className="w-8 h-8 text-charcoal-600" />,
  quality_metrics: <Target className="w-8 h-8 text-charcoal-600" />,
  account_portfolio: <Building2 className="w-8 h-8 text-charcoal-600" />,
  pipeline_analysis: <BarChart3 className="w-8 h-8 text-charcoal-600" />,
}

const QUICK_PERIODS = [
  { value: 'this_sprint', label: 'This Sprint' },
  { value: 'this_month', label: 'This Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'ytd', label: 'Year to Date' },
]

interface GenerateReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTemplate: string
}

function GenerateReportModal({ open, onOpenChange, selectedTemplate }: GenerateReportModalProps) {
  const [period, setPeriod] = useState('this_month')
  const [compareToPrevious, setCompareToPrevious] = useState(false)
  const [includeCharts, setIncludeCharts] = useState(false)

  const utils = trpc.useUtils()
  const generateMutation = trpc.reports.generate.useMutation({
    onSuccess: (data) => {
      toast.success('Report generated successfully')
      utils.reports.getSaved.invalidate()
      onOpenChange(false)
      // Could open report viewer here
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
      compareToPrevoiusPeriod: compareToPrevious,
      includeCharts,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {template?.icon}
            Generate {template?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Period */}
          <div className="space-y-2">
            <Label>Report Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_sprint">This Sprint</SelectItem>
                <SelectItem value="last_sprint">Last Sprint</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Options</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compare"
                checked={compareToPrevious}
                onCheckedChange={(c) => setCompareToPrevious(c as boolean)}
              />
              <Label htmlFor="compare" className="cursor-pointer">
                Compare to previous period
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="charts"
                checked={includeCharts}
                onCheckedChange={(c) => setIncludeCharts(c as boolean)}
              />
              <Label htmlFor="charts" className="cursor-pointer">
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

export default function ReportsPage() {
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showReportViewer, setShowReportViewer] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState('')

  const utils = trpc.useUtils()
  const { data: templates, isLoading: loadingTemplates } = trpc.reports.getTemplates.useQuery()
  const { data: savedReports, isLoading: loadingSaved } = trpc.reports.getSaved.useQuery({ limit: 10 })

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

  return (
    <>
      <DashboardShell
        title="My Reports"
        description="Generate and view performance reports"
        actions={
          <Button onClick={() => handleSelectTemplate('performance_summary')}>
            <FileBarChart className="w-4 h-4 mr-2" />
            New Report
          </Button>
        }
      >
        {/* Quick Reports */}
        <DashboardSection title="Quick Reports">
          <div className="flex gap-2 flex-wrap">
            {QUICK_PERIODS.map((p) => (
              <Button
                key={p.value}
                variant="outline"
                onClick={() => {
                  setSelectedTemplate('performance_summary')
                  setShowGenerateModal(true)
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </DashboardSection>

        {/* Report Templates */}
        <DashboardSection title="Report Templates" className="mt-8">
          {loadingTemplates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates?.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-elevation-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-charcoal-100 rounded-lg">
                        {REPORT_ICONS[template.id] || <FileBarChart className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal-900 mb-1">
                          {template.icon} {template.name}
                        </h3>
                        <p className="text-sm text-charcoal-500">
                          {template.description}
                        </p>
                        <Button size="sm" variant="ghost" className="mt-3 p-0 h-auto text-hublot-700">
                          Generate Report →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DashboardSection>

        {/* Saved Reports */}
        <DashboardSection title="Saved Reports" className="mt-8">
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
                      'flex items-center justify-between p-4 hover:bg-charcoal-50',
                      index !== savedReports.length - 1 && 'border-b'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-charcoal-100 rounded-lg">
                        <FileBarChart className="w-5 h-5 text-charcoal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900 capitalize">
                          {report.report_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-charcoal-500">
                          {new Date(report.start_date).toLocaleDateString()} -{' '}
                          {new Date(report.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-charcoal-500">
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
