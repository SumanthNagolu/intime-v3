'use client'

import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { Wallet, Calendar, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PayrollWidgetProps {
  className?: string
}

export function PayrollWidget({ className }: PayrollWidgetProps) {
  const { data, isLoading, error } = trpc.dashboard.getPayrollStats.useQuery()

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
        <p className="text-charcoal-500">Failed to load payroll data</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntil = (dateStr: string | null) => {
    if (!dateStr) return null
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const nextPayDays = getDaysUntil(data.nextPayDate)

  return (
    <div className={cn('bg-white rounded-lg border border-charcoal-100 shadow-elevation-sm', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gold-500" />
            <h3 className="font-heading text-h4 text-charcoal-900">Payroll</h3>
          </div>
          <Link
            href="/employee/finance/payroll"
            className="text-caption text-gold-600 hover:text-gold-700 transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Next Pay Date */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-charcoal-400" />
            <p className="text-caption text-charcoal-500">Next Pay Date</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-h3 text-charcoal-900">
              {formatDate(data.nextPayDate)}
            </span>
            {nextPayDays !== null && nextPayDays >= 0 && (
              <span className={cn(
                'text-body-sm',
                nextPayDays <= 3 ? 'text-warning-600' : 'text-charcoal-500'
              )}>
                ({nextPayDays === 0 ? 'Today' : nextPayDays === 1 ? 'Tomorrow' : `${nextPayDays} days`})
              </span>
            )}
          </div>
        </div>

        {/* Pending Amount */}
        <div className="p-4 bg-gold-50 rounded-lg mb-6">
          <p className="text-caption text-charcoal-500 mb-1">Pending Payroll</p>
          <span className="text-h2 text-charcoal-900">{formatCurrency(data.pendingAmount)}</span>
          {data.timesheetsReady > 0 && (
            <div className="flex items-center gap-1 mt-2 text-charcoal-600">
              <Clock className="h-4 w-4" />
              <span className="text-body-sm">{data.timesheetsReady} timesheets ready</span>
            </div>
          )}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-charcoal-50 rounded-lg text-center">
            <span className="text-h3 text-charcoal-900 block">
              {data.draftCount + data.pendingApprovalCount}
            </span>
            <span className="text-caption text-charcoal-500">In Progress</span>
          </div>

          <div className="p-3 bg-charcoal-50 rounded-lg text-center">
            <span className="text-h3 text-success-600 block">{data.completedCount}</span>
            <span className="text-caption text-charcoal-500">Completed</span>
          </div>
        </div>

        {/* YTD Stats */}
        <div className="border-t border-charcoal-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            <span className="text-body-sm font-medium text-charcoal-700">Year to Date</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-charcoal-500">Gross Pay</span>
              <span className="text-body font-medium text-charcoal-900">
                {formatCurrency(data.ytdGross)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-charcoal-500">Taxes</span>
              <span className="text-body font-medium text-charcoal-900">
                {formatCurrency(data.ytdTaxes)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-sm text-charcoal-500">Net Pay</span>
              <span className="text-body font-medium text-charcoal-900">
                {formatCurrency(data.ytdNet)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
