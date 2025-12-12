'use client'

import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { Clock, AlertTriangle, FileCheck, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface TimesheetsWidgetProps {
  className?: string
}

export function TimesheetsWidget({ className }: TimesheetsWidgetProps) {
  const { data, isLoading, error } = trpc.dashboard.getTimesheetsStats.useQuery()

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-charcoal-100 p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-charcoal-100 rounded w-32 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-charcoal-100 rounded w-full" />
            <div className="h-4 bg-charcoal-100 rounded w-3/4" />
            <div className="h-4 bg-charcoal-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className={cn('bg-white rounded-lg border border-charcoal-100 p-6', className)}>
        <p className="text-charcoal-500">Failed to load timesheet data</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <div className={cn('bg-white rounded-lg border border-charcoal-100 shadow-elevation-sm', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gold-500" />
            <h3 className="font-heading text-h4 text-charcoal-900">Timesheets</h3>
          </div>
          <Link
            href="/employee/finance/timesheets"
            className="text-caption text-gold-600 hover:text-gold-700 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Hours This Week */}
        <div className="mb-6">
          <p className="text-caption text-charcoal-500 mb-1">Hours This Week</p>
          <div className="flex items-baseline gap-2">
            <span className="text-h2 text-charcoal-900">{data.hoursThisWeek}</span>
            {data.overtimeHoursThisWeek > 0 && (
              <span className="text-body-sm text-warning-600">
                (+{data.overtimeHoursThisWeek} OT)
              </span>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-charcoal-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {data.pendingApproval > 0 && (
                <AlertTriangle className="h-4 w-4 text-warning-500" />
              )}
              <span className="text-caption text-charcoal-500">Pending Approval</span>
            </div>
            <span className={cn(
              'text-h3',
              data.pendingApproval > 0 ? 'text-warning-600' : 'text-charcoal-900'
            )}>
              {data.pendingApproval}
            </span>
          </div>

          <div className="p-3 bg-charcoal-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-caption text-charcoal-500">Drafts</span>
            </div>
            <span className="text-h3 text-charcoal-900">{data.drafts}</span>
          </div>

          <div className="p-3 bg-charcoal-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="h-4 w-4 text-success-500" />
              <span className="text-caption text-charcoal-500">Ready to Invoice</span>
            </div>
            <span className="text-h3 text-success-600">{data.readyToInvoice}</span>
          </div>

          <div className="p-3 bg-charcoal-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-gold-500" />
              <span className="text-caption text-charcoal-500">Ready for Payroll</span>
            </div>
            <span className="text-h3 text-gold-600">{data.readyForPayroll}</span>
          </div>
        </div>

        {/* Pending Amounts */}
        <div className="border-t border-charcoal-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-body-sm text-charcoal-600">Pending Billable</span>
            <span className="text-body font-medium text-charcoal-900">
              {formatCurrency(data.pendingBillableAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-sm text-charcoal-600">Pending Payable</span>
            <span className="text-body font-medium text-charcoal-900">
              {formatCurrency(data.pendingPayableAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
