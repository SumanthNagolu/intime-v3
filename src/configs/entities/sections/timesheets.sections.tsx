'use client'

/**
 * PCF-Compatible Section Adapters for Timesheets
 * TIMESHEETS-01: Section components for timesheet detail view
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Clock,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  User,
  FileText,
  Activity,
  Receipt,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  Timesheet,
  TimesheetEntry,
  TimesheetExpense,
  TIMESHEET_STATUS_CONFIG,
  EXPENSE_CATEGORIES,
  formatCurrency,
  formatHours,
} from '../timesheets.config'

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

// ============================================
// OVERVIEW SECTION
// ============================================

export function TimesheetOverviewSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const timesheet = entity as Timesheet | undefined

  if (!timesheet) return null

  const totalHours =
    timesheet.totalRegularHours +
    timesheet.totalOvertimeHours +
    timesheet.totalDoubleTimeHours +
    timesheet.totalPtoHours +
    timesheet.totalHolidayHours

  const statusConfig = TIMESHEET_STATUS_CONFIG[timesheet.status]

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Period Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Period Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Period Start</span>
                <p className="font-medium">
                  {format(new Date(timesheet.periodStart), 'EEEE, MMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Period End</span>
                <p className="font-medium">
                  {format(new Date(timesheet.periodEnd), 'EEEE, MMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Period Type</span>
                <p className="font-medium capitalize">{timesheet.periodType.replace('_', '-')}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Status</span>
                <div className="mt-1">
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consultant & Job Info */}
        {timesheet.placement && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Consultant & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timesheet.placement.candidate && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-charcoal-500">Consultant</span>
                    <Link
                      href={`/employee/recruiting/candidates/${timesheet.placement.candidate.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {timesheet.placement.candidate.first_name} {timesheet.placement.candidate.last_name}
                    </Link>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/candidates/${timesheet.placement.candidate.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              )}
              {timesheet.placement.job && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-charcoal-500">Job</span>
                    <Link
                      href={`/employee/recruiting/jobs/${timesheet.placement.job.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {timesheet.placement.job.title}
                    </Link>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/jobs/${timesheet.placement.job.id}`}>
                      View Job
                    </Link>
                  </Button>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <span className="text-sm text-charcoal-500">Placement</span>
                  <Link
                    href={`/employee/recruiting/placements/${timesheet.placementId}`}
                    className="block font-medium text-hublot-900 hover:underline"
                  >
                    View Placement Details
                  </Link>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/recruiting/placements/${timesheet.placementId}`}>
                    View Placement
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission Info */}
        {timesheet.submittedAt && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Submitted</span>
                <span className="font-medium">
                  {format(new Date(timesheet.submittedAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {timesheet.submitter && (
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-500">Submitted By</span>
                  <span className="font-medium">{timesheet.submitter.full_name}</span>
                </div>
              )}
              {timesheet.invoiceId && (
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-charcoal-500">Invoice</span>
                  <Link
                    href={`/employee/finance/invoices/${timesheet.invoiceId}`}
                    className="font-medium text-hublot-900 hover:underline"
                  >
                    View Invoice
                  </Link>
                </div>
              )}
              {timesheet.payrollRunId && (
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-500">Payroll Run</span>
                  <Link
                    href={`/employee/finance/payroll/${timesheet.payrollRunId}`}
                    className="font-medium text-hublot-900 hover:underline"
                  >
                    View Payroll
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Summary Cards */}
      <div className="space-y-6">
        {/* Hours Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Hours Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Regular</span>
              <span className="font-medium">{formatHours(timesheet.totalRegularHours)}h</span>
            </div>
            {timesheet.totalOvertimeHours > 0 && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Overtime</span>
                <span className="font-medium text-amber-600">
                  {formatHours(timesheet.totalOvertimeHours)}h
                </span>
              </div>
            )}
            {timesheet.totalDoubleTimeHours > 0 && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Double Time</span>
                <span className="font-medium text-orange-600">
                  {formatHours(timesheet.totalDoubleTimeHours)}h
                </span>
              </div>
            )}
            {timesheet.totalPtoHours > 0 && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">PTO</span>
                <span className="font-medium text-blue-600">
                  {formatHours(timesheet.totalPtoHours)}h
                </span>
              </div>
            )}
            {timesheet.totalHolidayHours > 0 && (
              <div className="flex justify-between">
                <span className="text-charcoal-500">Holiday</span>
                <span className="font-medium text-green-600">
                  {formatHours(timesheet.totalHolidayHours)}h
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-charcoal-700 font-medium">Total Hours</span>
              <span className="font-bold text-lg">{formatHours(totalHours)}h</span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Billable Amount</span>
              <span className="font-medium text-lg">
                {formatCurrency(timesheet.totalBillableAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Payable Amount</span>
              <span className="font-medium">{formatCurrency(timesheet.totalPayableAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-charcoal-700 font-medium">Margin</span>
              <span className="font-bold text-green-600">
                {formatCurrency(timesheet.totalBillableAmount - timesheet.totalPayableAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(timesheet.createdAt), { addSuffix: true })}
              </span>
            </div>
            {timesheet.submittedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Submitted</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(timesheet.submittedAt), { addSuffix: true })}
                </span>
              </div>
            )}
            {timesheet.processedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Processed</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(timesheet.processedAt), { addSuffix: true })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================
// ENTRIES SECTION
// ============================================

export function TimesheetEntriesSectionPCF({ entityId }: PCFSectionProps) {
  const entriesQuery = trpc.timesheets.entries.list.useQuery({ timesheetId: entityId })
  const entries = (entriesQuery.data ?? []) as TimesheetEntry[]

  const totalRegular = entries.reduce((sum, e) => sum + e.regularHours, 0)
  const totalOT = entries.reduce((sum, e) => sum + e.overtimeHours, 0)
  const totalDT = entries.reduce((sum, e) => sum + e.doubleTimeHours, 0)
  const totalBillable = entries.reduce((sum, e) => sum + e.billableAmount, 0)

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Time Entries
        </CardTitle>
        <div className="text-sm text-charcoal-500">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      </CardHeader>
      <CardContent>
        {entriesQuery.isLoading ? (
          <div className="text-center py-8 text-charcoal-500">Loading entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <Calendar className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No time entries recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-200">
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">Date</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Regular</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">OT</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">DT</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Total</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Billable</th>
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const dayTotal = entry.regularHours + entry.overtimeHours + entry.doubleTimeHours
                    return (
                      <tr key={entry.id} className="border-b border-charcoal-100 hover:bg-charcoal-50">
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {format(new Date(entry.workDate), 'EEE, MMM d')}
                          </div>
                          {entry.startTime && entry.endTime && (
                            <div className="text-xs text-charcoal-500">
                              {entry.startTime} - {entry.endTime}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">{formatHours(entry.regularHours)}</td>
                        <td className="py-3 px-2 text-right text-amber-600">
                          {entry.overtimeHours > 0 ? formatHours(entry.overtimeHours) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right text-orange-600">
                          {entry.doubleTimeHours > 0 ? formatHours(entry.doubleTimeHours) : '-'}
                        </td>
                        <td className="py-3 px-2 text-right font-medium">{formatHours(dayTotal)}</td>
                        <td className="py-3 px-2 text-right font-medium">
                          {formatCurrency(entry.billableAmount)}
                        </td>
                        <td className="py-3 px-2 text-charcoal-600 max-w-[200px] truncate">
                          {entry.description || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-charcoal-50 font-medium">
                    <td className="py-3 px-2">Totals</td>
                    <td className="py-3 px-2 text-right">{formatHours(totalRegular)}</td>
                    <td className="py-3 px-2 text-right text-amber-600">{formatHours(totalOT)}</td>
                    <td className="py-3 px-2 text-right text-orange-600">{formatHours(totalDT)}</td>
                    <td className="py-3 px-2 text-right font-bold">
                      {formatHours(totalRegular + totalOT + totalDT)}
                    </td>
                    <td className="py-3 px-2 text-right font-bold">{formatCurrency(totalBillable)}</td>
                    <td className="py-3 px-2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// EXPENSES SECTION
// ============================================

export function TimesheetExpensesSectionPCF({ entityId }: PCFSectionProps) {
  const expensesQuery = trpc.timesheets.expenses.list.useQuery({ timesheetId: entityId })
  const expenses = (expensesQuery.data ?? []) as TimesheetExpense[]

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
  const billableTotal = expenses.filter((e) => e.isBillable).reduce((sum, e) => sum + e.amount, 0)

  const getCategoryLabel = (cat: string) => {
    const found = EXPENSE_CATEGORIES.find((c) => c.value === cat)
    return found?.label || cat
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Expenses
        </CardTitle>
        <div className="text-sm text-charcoal-500">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </div>
      </CardHeader>
      <CardContent>
        {expensesQuery.isLoading ? (
          <div className="text-center py-8 text-charcoal-500">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <Receipt className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No expenses recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Expenses List */}
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 border rounded-lg hover:bg-charcoal-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(expense.category)}
                        </Badge>
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {expense.isBillable && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Billable
                          </span>
                        )}
                        {expense.isReimbursable && (
                          <span className="text-blue-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Reimbursable
                          </span>
                        )}
                        {expense.receiptVerified && (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Receipt Verified
                          </span>
                        )}
                        {expense.receiptUrl && !expense.receiptVerified && (
                          <span className="text-amber-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Pending Verification
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(expense.amount)}</div>
                      {expense.receiptUrl && (
                        <a
                          href={expense.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-hublot-600 hover:underline"
                        >
                          View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Total Expenses</span>
                <span className="font-medium">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Billable Expenses</span>
                <span className="font-medium text-green-600">{formatCurrency(billableTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// APPROVALS SECTION
// ============================================

export function TimesheetApprovalsSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const timesheet = entity as Timesheet | undefined

  if (!timesheet) return null

  const approvalSteps = [
    {
      label: 'Client Approval',
      status: timesheet.clientApprovalStatus,
      approvedAt: timesheet.clientApprovedAt,
      notes: timesheet.clientApprovalNotes,
    },
    {
      label: 'Internal Approval',
      status: timesheet.internalApprovalStatus,
      approvedAt: timesheet.internalApprovedAt,
      notes: timesheet.internalApprovalNotes,
    },
  ]

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />
      default:
        return <Clock className="w-5 h-5 text-charcoal-300" />
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
      case 'delegated':
        return <Badge className="bg-blue-100 text-blue-800">Delegated</Badge>
      case 'escalated':
        return <Badge className="bg-orange-100 text-orange-800">Escalated</Badge>
      default:
        return <Badge className="bg-charcoal-100 text-charcoal-600">Not Started</Badge>
    }
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Approval Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {approvalSteps.map((step, idx) => (
            <div key={idx} className="relative">
              {idx < approvalSteps.length - 1 && (
                <div className="absolute left-[10px] top-[30px] bottom-0 w-[2px] bg-charcoal-200" />
              )}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{step.label}</span>
                    {getStatusBadge(step.status)}
                  </div>
                  {step.approvedAt && (
                    <div className="text-sm text-charcoal-500">
                      {format(new Date(step.approvedAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                  {step.notes && (
                    <div className="mt-2 p-3 bg-charcoal-50 rounded text-sm text-charcoal-700">
                      {step.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Final Status */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Final Status</span>
              <Badge
                className={`${TIMESHEET_STATUS_CONFIG[timesheet.status].bgColor} ${TIMESHEET_STATUS_CONFIG[timesheet.status].textColor}`}
              >
                {TIMESHEET_STATUS_CONFIG[timesheet.status].label}
              </Badge>
            </div>
            {timesheet.processedAt && (
              <div className="text-sm text-charcoal-500 mt-2">
                Processed on {format(new Date(timesheet.processedAt), 'MMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// ACTIVITIES SECTION
// ============================================

export function TimesheetActivitiesSectionPCF({ entityId: _entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// NOTES SECTION
// ============================================

export function TimesheetNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No notes added yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// DOCUMENTS SECTION
// ============================================

export function TimesheetDocumentsSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No documents uploaded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// HISTORY SECTION
// ============================================

export function TimesheetHistorySectionPCF({ entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Clock className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>Change history will appear here</p>
        </div>
      </CardContent>
    </Card>
  )
}
