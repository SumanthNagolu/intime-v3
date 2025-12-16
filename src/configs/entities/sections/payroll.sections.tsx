'use client'

/**
 * PCF-Compatible Section Adapters for Payroll (Pay Runs)
 * PAYROLL-01: Section components for pay run detail view
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, formatDistanceToNow } from 'date-fns'
import {
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  FileText,
  Activity,
  Calendar,
  Calculator,
  Building2,
  User,
  Briefcase,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import {
  PayRun,
  PayItem,
  PAY_RUN_STATUS_CONFIG,
  PAY_RUN_TYPE_CONFIG,
  WORKER_TYPE_CONFIG,
  formatCurrency,
  calculateTotalWorkers,
} from '../payroll.config'

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

// ============================================
// OVERVIEW SECTION
// ============================================

export function PayrollOverviewSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const payRun = entity as PayRun | undefined

  if (!payRun) return null

  const statusConfig = PAY_RUN_STATUS_CONFIG[payRun.status]
  const typeConfig = PAY_RUN_TYPE_CONFIG[payRun.runType]
  const totalWorkers = calculateTotalWorkers(payRun)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Pay Run Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pay Run Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Run Number</span>
                <p className="font-medium text-lg">{payRun.runNumber}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Run Type</span>
                <p className="font-medium">{typeConfig?.label || payRun.runType}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Check Date</span>
                <p className="font-medium">
                  {format(new Date(payRun.checkDate), 'EEEE, MMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Direct Deposit Date</span>
                <p className="font-medium">
                  {payRun.directDepositDate
                    ? format(new Date(payRun.directDepositDate), 'MMM d, yyyy')
                    : 'Same as check date'}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Status</span>
                <div className="mt-1">
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Workers</span>
                <p className="font-medium">{totalWorkers} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pay Period Card */}
        {payRun.payPeriod && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pay Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-charcoal-500">Period Start</span>
                  <p className="font-medium">
                    {format(new Date(payRun.payPeriod.period_start), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-charcoal-500">Period End</span>
                  <p className="font-medium">
                    {format(new Date(payRun.payPeriod.period_end), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-charcoal-500">Period Type</span>
                  <p className="font-medium capitalize">
                    {payRun.payPeriod.period_type.replace('_', '-')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Worker Breakdown Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Worker Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Employees</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{payRun.employeeCount}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Consultants</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{payRun.consultantCount}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Contractors</span>
                </div>
                <p className="text-2xl font-bold text-amber-900">{payRun.contractorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {payRun.notes && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">{payRun.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Financial Summary */}
      <div className="space-y-6">
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
              <span className="text-charcoal-500">Gross Pay</span>
              <span className="font-bold text-lg">{formatCurrency(payRun.totalGross)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Employee Taxes</span>
              <span className="text-red-600">-{formatCurrency(payRun.totalEmployeeTaxes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Deductions</span>
              <span className="text-red-600">-{formatCurrency(payRun.totalDeductions)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Net Pay</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(payRun.totalNet)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Employer Costs */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Employer Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Employer Taxes</span>
              <span className="font-medium">{formatCurrency(payRun.totalEmployerTaxes)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total Employer Cost</span>
              <span className="font-bold text-lg">{formatCurrency(payRun.totalEmployerCost)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Approval Info */}
        {payRun.approvedAt && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Approved</span>
                <span className="font-medium">
                  {format(new Date(payRun.approvedAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {payRun.approver && (
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-500">Approved By</span>
                  <span className="font-medium">{payRun.approver.full_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                {formatDistanceToNow(new Date(payRun.createdAt), { addSuffix: true })}
              </span>
            </div>
            {payRun.calculatedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Calculated</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(payRun.calculatedAt), { addSuffix: true })}
                </span>
              </div>
            )}
            {payRun.submittedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Submitted</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(payRun.submittedAt), { addSuffix: true })}
                </span>
              </div>
            )}
            {payRun.processedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Processed</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(payRun.processedAt), { addSuffix: true })}
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
// PAY ITEMS SECTION
// ============================================

export function PayrollPayItemsSectionPCF({ entityId }: PCFSectionProps) {
  const payItemsQuery = trpc.payroll.payItems.list.useQuery({ payRunId: entityId })
  const payItems = (payItemsQuery.data ?? []) as PayItem[]

  const totalGross = payItems.reduce((sum, item) => sum + item.grossPay, 0)
  const totalNet = payItems.reduce((sum, item) => sum + item.netPay, 0)

  const getWorkerTypeBadge = (type: string) => {
    const config = WORKER_TYPE_CONFIG[type as keyof typeof WORKER_TYPE_CONFIG]
    if (!config) return <Badge variant="outline">{type}</Badge>
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Pay Items
        </CardTitle>
        <div className="text-sm text-charcoal-500">
          {payItems.length} {payItems.length === 1 ? 'worker' : 'workers'}
        </div>
      </CardHeader>
      <CardContent>
        {payItemsQuery.isLoading ? (
          <div className="text-center py-8 text-charcoal-500">Loading pay items...</div>
        ) : payItems.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No pay items in this run</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pay Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-200">
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">Worker</th>
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">Type</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Hours</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Gross</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Taxes</th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">
                      Deductions
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-charcoal-600">Net</th>
                    <th className="text-left py-3 px-2 font-medium text-charcoal-600">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {payItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-charcoal-100 hover:bg-charcoal-50"
                    >
                      <td className="py-3 px-2">
                        {item.contact ? (
                          <Link
                            href={`/employee/crm/contacts/${item.contactId}`}
                            className="font-medium text-hublot-900 hover:underline"
                          >
                            {item.contact.first_name} {item.contact.last_name}
                          </Link>
                        ) : (
                          <span className="text-charcoal-500">Unknown</span>
                        )}
                      </td>
                      <td className="py-3 px-2">{getWorkerTypeBadge(item.workerType)}</td>
                      <td className="py-3 px-2 text-right">
                        {item.totalHours > 0 ? item.totalHours.toFixed(1) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatCurrency(item.grossPay)}
                      </td>
                      <td className="py-3 px-2 text-right text-red-600">
                        -{formatCurrency(item.totalEmployeeTaxes)}
                      </td>
                      <td className="py-3 px-2 text-right text-red-600">
                        -{formatCurrency(item.totalDeductions)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-green-600">
                        {formatCurrency(item.netPay)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-charcoal-400" />
                          <span className="text-xs capitalize">
                            {item.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-charcoal-50 font-bold">
                    <td colSpan={3} className="py-3 px-2 text-right">
                      Totals
                    </td>
                    <td className="py-3 px-2 text-right">{formatCurrency(totalGross)}</td>
                    <td className="py-3 px-2 text-right text-red-600">
                      -{formatCurrency(payItems.reduce((s, i) => s + i.totalEmployeeTaxes, 0))}
                    </td>
                    <td className="py-3 px-2 text-right text-red-600">
                      -{formatCurrency(payItems.reduce((s, i) => s + i.totalDeductions, 0))}
                    </td>
                    <td className="py-3 px-2 text-right text-green-600">
                      {formatCurrency(totalNet)}
                    </td>
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
// TAXES & DEDUCTIONS SECTION
// ============================================

export function PayrollTaxesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const payRun = entity as PayRun | undefined

  if (!payRun) return null

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Employee Taxes */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Employee Taxes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-8 text-charcoal-500">
            <Calculator className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>Tax breakdown by category coming soon</p>
            <div className="mt-4 p-4 bg-charcoal-50 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Total Employee Taxes</span>
                <span className="font-bold text-lg">
                  {formatCurrency(payRun.totalEmployeeTaxes)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employer Taxes */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Employer Taxes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-8 text-charcoal-500">
            <Building2 className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>Employer tax breakdown coming soon</p>
            <div className="mt-4 p-4 bg-charcoal-50 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Total Employer Taxes</span>
                <span className="font-bold text-lg">
                  {formatCurrency(payRun.totalEmployerTaxes)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions */}
      <Card className="bg-white col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Deductions Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-charcoal-500">
            <DollarSign className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>Deduction breakdown by category coming soon</p>
            <div className="mt-4 p-4 bg-charcoal-50 rounded-lg max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="font-medium">Total Deductions</span>
                <span className="font-bold text-lg">{formatCurrency(payRun.totalDeductions)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// ACTIVITIES SECTION
// ============================================

export function PayrollActivitiesSectionPCF({ entityId }: PCFSectionProps) {
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

export function PayrollNotesSectionPCF({ entityId }: PCFSectionProps) {
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

export function PayrollDocumentsSectionPCF({ entityId }: PCFSectionProps) {
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

export function PayrollHistorySectionPCF({ entityId }: PCFSectionProps) {
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
