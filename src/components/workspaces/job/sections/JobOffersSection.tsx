'use client'

import * as React from 'react'
import { Gift, User, DollarSign, Calendar, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { FullJob, OfferItem } from '@/types/job'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface JobOffersSectionProps {
  job: FullJob
  onRefresh?: () => void
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', icon: Clock },
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: Clock },
  sent: { label: 'Sent', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: Clock },
  accepted: { label: 'Accepted', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', icon: CheckCircle },
  declined: { label: 'Declined', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500', icon: XCircle },
  withdrawn: { label: 'Withdrawn', bg: 'bg-charcoal-100', text: 'text-charcoal-500', dot: 'bg-charcoal-400', icon: XCircle },
  expired: { label: 'Expired', bg: 'bg-charcoal-100', text: 'text-charcoal-500', dot: 'bg-charcoal-400', icon: Clock },
}

/**
 * JobOffersSection - List of all offers for this job
 */
export function JobOffersSection({ job, onRefresh }: JobOffersSectionProps) {
  const offers = job.sections?.offers?.items || []
  const pendingCount = job.sections?.offers?.pending || 0

  // Separate by status
  const { active, completed } = React.useMemo(() => {
    const active = offers.filter(o => ['draft', 'pending', 'sent'].includes(o.status))
    const completed = offers.filter(o => ['accepted', 'declined', 'withdrawn', 'expired'].includes(o.status))
    return { active, completed }
  }, [offers])

  return (
    <div className="space-y-6">
      {/* Active Offers */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Gift className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Active Offers</h3>
                <p className="text-xs text-charcoal-500">{pendingCount} pending response</p>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-charcoal-100">
          {active.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Gift className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">No active offers</p>
            </div>
          ) : (
            active.map((offer) => (
              <OfferRow key={offer.id} offer={offer} />
            ))
          )}
        </div>
      </div>

      {/* Completed Offers */}
      {completed.length > 0 && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Completed Offers</h3>
                <p className="text-xs text-charcoal-500">{completed.length} offers</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-charcoal-100">
            {completed.map((offer) => (
              <OfferRow key={offer.id} offer={offer} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OfferRow({ offer }: { offer: OfferItem }) {
  const statusConfig = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending
  const StatusIcon = statusConfig.icon

  return (
    <Link
      href={`/employee/recruiting/offers/${offer.id}`}
      className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50 transition-colors"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
        <User className="h-5 w-5 text-charcoal-500" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-charcoal-900">
            {offer.candidate?.first_name} {offer.candidate?.last_name}
          </p>
          <Badge className={cn(
            'capitalize text-xs px-2 py-0.5',
            statusConfig.bg,
            statusConfig.text
          )}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Created {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="text-sm font-semibold text-charcoal-900">
          ${Number(offer.rate || offer.pay_rate || offer.bill_rate || 0).toFixed(0)}/hr
        </p>
        <p className="text-xs text-charcoal-500 capitalize">{String(offer.offer_type || 'contract')}</p>
      </div>

      <ArrowRight className="h-4 w-4 text-charcoal-400 flex-shrink-0" />
    </Link>
  )
}

export default JobOffersSection
