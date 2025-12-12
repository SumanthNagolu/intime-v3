'use client'

import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { FileText, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface InvoicesWidgetProps {
  className?: string
}

export function InvoicesWidget({ className }: InvoicesWidgetProps) {
  const { data, isLoading, error } = trpc.dashboard.getInvoicesStats.useQuery()

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
        <p className="text-charcoal-500">Failed to load invoice data</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

  return (
    <div className={cn('bg-white rounded-lg border border-charcoal-100 shadow-elevation-sm', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold-500" />
            <h3 className="font-heading text-h4 text-charcoal-900">Invoices</h3>
          </div>
          <Link
            href="/employee/finance/invoices"
            className="text-caption text-gold-600 hover:text-gold-700 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Outstanding Balance */}
        <div className="mb-6">
          <p className="text-caption text-charcoal-500 mb-1">Outstanding Balance</p>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              'text-h2',
              data.outstandingBalance > 0 ? 'text-charcoal-900' : 'text-success-600'
            )}>
              {formatCurrency(data.outstandingBalance)}
            </span>
          </div>
          {data.overdueCount > 0 && (
            <div className="flex items-center gap-1 mt-1 text-error-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-body-sm">{data.overdueCount} overdue ({formatCurrency(data.overdueAmount)})</span>
            </div>
          )}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-charcoal-50 rounded-lg text-center">
            <span className="text-h3 text-charcoal-900 block">{data.draftCount}</span>
            <span className="text-caption text-charcoal-500">Drafts</span>
          </div>

          <div className="p-3 bg-charcoal-50 rounded-lg text-center">
            <span className="text-h3 text-gold-600 block">{data.sentCount}</span>
            <span className="text-caption text-charcoal-500">Sent</span>
          </div>

          <div className="p-3 bg-charcoal-50 rounded-lg text-center">
            <span className="text-h3 text-success-600 block">{data.paidCount}</span>
            <span className="text-caption text-charcoal-500">Paid</span>
          </div>
        </div>

        {/* YTD Revenue */}
        <div className="border-t border-charcoal-100 pt-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success-500" />
            <span className="text-body-sm text-charcoal-600">YTD Revenue</span>
          </div>
          <span className="text-h3 text-charcoal-900 block">{formatCurrency(data.ytdRevenue)}</span>

          {data.avgDaysToPay > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <CheckCircle className="h-4 w-4 text-charcoal-400" />
              <span className="text-body-sm text-charcoal-500">
                Avg {data.avgDaysToPay} days to pay
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
