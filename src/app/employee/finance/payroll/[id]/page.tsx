'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { DetailHeader } from '@/components/pcf/detail-view/DetailHeader'
import { PAY_RUN_STATUS_CONFIG, formatCurrency, formatPeriod } from '@/configs/entities/payroll.config'
import { trpc } from '@/lib/trpc/client'
import { Card } from '@/components/ui/card'
import { FileText, DollarSign, Users, Calendar, Clock, Calculator, CreditCard } from 'lucide-react'

export default function PayRunDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const payRunId = params.id as string
  const section = searchParams.get('section') || 'overview'

  const { data: payRun, isLoading, error } = trpc.payroll.getById.useQuery(
    { id: payRunId },
    { enabled: !!payRunId }
  )

  if (isLoading) {
    return (
      <SidebarLayout sectionId="payroll">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-charcoal-500">Loading pay run...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error || !payRun) {
    return (
      <SidebarLayout sectionId="payroll">
        <div className="flex items-center justify-center h-64">
          <div className="text-error-500">Pay run not found</div>
        </div>
      </SidebarLayout>
    )
  }

  const statusConfig = PAY_RUN_STATUS_CONFIG[payRun.status as keyof typeof PAY_RUN_STATUS_CONFIG]
  const totalWorkers = payRun.employeeCount + payRun.consultantCount + payRun.contractorCount

  return (
    <SidebarLayout sectionId="payroll">
      <div className="space-y-6">
        <DetailHeader
          entity={payRun}
          titleField="runNumber"
          subtitleFields={[
            { key: 'runType', format: (v) => String(v).replace('_', ' ').toUpperCase() },
          ]}
          statusField="status"
          statusConfig={PAY_RUN_STATUS_CONFIG}
          breadcrumbs={[
            { label: 'Finance', href: '/employee/finance/invoices' },
            { label: 'Payroll', href: '/employee/finance/payroll' },
            { label: payRun.runNumber, href: `/employee/finance/payroll/${payRun.id}` },
          ]}
        />

        {section === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pay Run Summary Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-charcoal-500" />
                  Pay Run Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-charcoal-500">Run Number</p>
                    <p className="font-medium">{payRun.runNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Run Type</p>
                    <p className="font-medium capitalize">{payRun.runType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.bgColor || 'bg-charcoal-100'} ${statusConfig?.textColor || 'text-charcoal-700'}`}>
                      {statusConfig?.label || payRun.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Total Workers</p>
                    <p className="font-medium">{totalWorkers}</p>
                  </div>
                </div>
              </Card>

              {/* Dates Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-charcoal-500" />
                  Important Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {payRun.payPeriod != null && (
                    <div>
                      <p className="text-sm text-charcoal-500">Pay Period</p>
                      <p className="font-medium">
                        {formatPeriod(
                          String((payRun.payPeriod as Record<string, unknown>).period_start || ''),
                          String((payRun.payPeriod as Record<string, unknown>).period_end || '')
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-charcoal-500">Check Date</p>
                    <p className="font-medium">{new Date(payRun.checkDate).toLocaleDateString()}</p>
                  </div>
                  {payRun.directDepositDate && (
                    <div>
                      <p className="text-sm text-charcoal-500">Direct Deposit Date</p>
                      <p className="font-medium">{new Date(payRun.directDepositDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {payRun.calculatedAt && (
                    <div>
                      <p className="text-sm text-charcoal-500">Calculated At</p>
                      <p className="font-medium">{new Date(payRun.calculatedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {payRun.approvedAt && (
                    <div>
                      <p className="text-sm text-charcoal-500">Approved At</p>
                      <p className="font-medium">{new Date(payRun.approvedAt).toLocaleString()}</p>
                    </div>
                  )}
                  {payRun.processedAt && (
                    <div>
                      <p className="text-sm text-charcoal-500">Processed At</p>
                      <p className="font-medium">{new Date(payRun.processedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Worker Breakdown */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-charcoal-500" />
                  Worker Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">{payRun.employeeCount}</p>
                    <p className="text-sm text-blue-600">Employees</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">{payRun.consultantCount}</p>
                    <p className="text-sm text-purple-600">Consultants</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">{payRun.contractorCount}</p>
                    <p className="text-sm text-amber-600">Contractors</p>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              {payRun.notes && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-charcoal-700">{payRun.notes}</p>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pay Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-charcoal-500" />
                  Pay Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Gross Pay</span>
                    <span className="font-medium">{formatCurrency(payRun.totalGross)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Employee Taxes</span>
                    <span className="text-error-600">-{formatCurrency(payRun.totalEmployeeTaxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Deductions</span>
                    <span className="text-error-600">-{formatCurrency(payRun.totalDeductions)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Net Pay</span>
                    <span className="font-semibold text-lg text-success-600">{formatCurrency(payRun.totalNet)}</span>
                  </div>
                </div>
              </Card>

              {/* Employer Costs */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-charcoal-500" />
                  Employer Costs
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Gross Pay</span>
                    <span className="font-medium">{formatCurrency(payRun.totalGross)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-500">Employer Taxes</span>
                    <span className="font-medium">{formatCurrency(payRun.totalEmployerTaxes)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Total Cost</span>
                    <span className="font-semibold text-lg">{formatCurrency(payRun.totalEmployerCost)}</span>
                  </div>
                </div>
              </Card>

              {/* Processing Info */}
              {payRun.payrollProvider && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-charcoal-500" />
                    Processing
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-charcoal-500">Provider</p>
                      <p className="font-medium">{payRun.payrollProvider}</p>
                    </div>
                    {payRun.externalRunId && (
                      <div>
                        <p className="text-sm text-charcoal-500">External Run ID</p>
                        <p className="font-medium font-mono text-sm">{payRun.externalRunId}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Approver */}
              {payRun.approver != null && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-charcoal-500" />
                    Approved By
                  </h3>
                  <p className="font-medium">
                    {String((payRun.approver as Record<string, unknown>).full_name || '')}
                  </p>
                  {payRun.approvedAt && (
                    <p className="text-sm text-charcoal-500 mt-1">
                      {new Date(payRun.approvedAt).toLocaleString()}
                    </p>
                  )}
                </Card>
              )}
            </div>
          </div>
        )}

        {section === 'payItems' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-charcoal-500" />
              Pay Items ({totalWorkers})
            </h3>
            <p className="text-charcoal-500">Pay items section - coming soon</p>
          </Card>
        )}

        {section === 'taxes' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-charcoal-500" />
              Taxes & Deductions
            </h3>
            <p className="text-charcoal-500">Taxes & deductions section - coming soon</p>
          </Card>
        )}
      </div>
    </SidebarLayout>
  )
}
