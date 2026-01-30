'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  ChevronRight,
  Loader2,
  FileText,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock },
  pending_approval: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Clock },
  paid: { label: 'Paid', color: 'bg-teal-100 text-teal-700', icon: CreditCard },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState('my-reports')

  const { data: dashboard, isLoading: dashboardLoading } = trpc.expenses.dashboard.useQuery()
  const { data: stats, isLoading: statsLoading } = trpc.expenses.reports.stats.useQuery()
  const { data: myDrafts } = trpc.expenses.reports.getMyDrafts.useQuery()
  const { data: awaitingApproval } = trpc.expenses.reports.getAwaitingMyApproval.useQuery()

  const isLoading = dashboardLoading || statsLoading

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">Expense Reports</h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Submit and manage expense reimbursements
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Expense Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">My Drafts</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.myDrafts ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Awaiting Approval</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : dashboard?.awaitingMyApproval ?? 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Pending Amount</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : formatCurrency(dashboard?.pendingAmount ?? 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption text-charcoal-500 uppercase tracking-wider">Total Paid</p>
                <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                  {isLoading ? '—' : formatCurrency(stats?.totalPaid ?? 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="approvals">Approvals ({dashboard?.awaitingMyApproval ?? 0})</TabsTrigger>
          <TabsTrigger value="all-reports">All Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">My Expense Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {!myDrafts?.length && !dashboard?.recentReports?.length ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                    <Receipt className="h-8 w-8 text-charcoal-400" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                    No Expense Reports
                  </h3>
                  <p className="text-body text-charcoal-500 text-center max-w-md mb-6">
                    Create an expense report to get reimbursed.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Expense Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...(myDrafts ?? []), ...(dashboard?.recentReports ?? [])].map((report) => {
                    const statusConfig = STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG]
                    const StatusIcon = statusConfig?.icon || FileText
                    return (
                      <Link
                        key={report.id}
                        href={`/employee/operations/expenses/${report.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:border-charcoal-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-charcoal-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900">{report.title}</p>
                            <p className="text-sm text-charcoal-500">
                              {report.report_number} • {new Date(report.submitted_at || report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-charcoal-900">
                            {formatCurrency(report.total_amount || 0)}
                          </span>
                          <Badge className={cn('flex items-center gap-1', statusConfig?.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig?.label}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-charcoal-400" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">Awaiting My Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {!awaitingApproval?.length ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-charcoal-500">No reports awaiting your approval.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {awaitingApproval.map((report) => {
                    const employee = report.employee as {
                      job_title: string
                      user: { full_name: string; avatar_url?: string | null }
                    }
                    return (
                      <Link
                        key={report.id}
                        href={`/employee/operations/expenses/${report.id}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-charcoal-100 hover:border-charcoal-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900">{report.title}</p>
                            <p className="text-sm text-charcoal-500">
                              {employee?.user?.full_name} • {employee?.job_title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-charcoal-900">
                            {formatCurrency(report.total_amount || 0)}
                          </span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              Reject
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Approve
                            </Button>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-heading font-semibold">All Expense Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-12">
                <p className="text-charcoal-500">Use filters to search all reports.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
