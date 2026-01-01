'use client'

import {
  Building2,
  Briefcase,
  Mail,
  Phone,
  FileText,
  Gift,
  Send,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FullOffer } from '@/types/offer'
import { OFFER_STATUS_CONFIG, OFFER_EMPLOYMENT_TYPE_CONFIG } from '@/configs/entities/offers.config'

interface OfferContextHeaderProps {
  offer: FullOffer
  onQuickAction?: (action: string) => void
}

export function OfferContextHeader({
  offer,
  onQuickAction,
}: OfferContextHeaderProps) {
  const submission = offer.submission
  const candidate = submission?.candidate
  const job = submission?.job || offer.job
  const account = offer.account

  const offerStatus = offer.status as string
  const employmentType = offer.employment_type as string | undefined

  const statusConfig = OFFER_STATUS_CONFIG[offerStatus] || {
    label: offerStatus,
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  }

  const employmentConfig = employmentType
    ? OFFER_EMPLOYMENT_TYPE_CONFIG[employmentType]
    : null

  // Format dates
  const sentAtValue = offer.sent_at as string | null | undefined
  const sentAt = sentAtValue
    ? new Date(sentAtValue).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const expiresAtValue = offer.expires_at as string | null | undefined
  const expiresAt = expiresAtValue
    ? new Date(expiresAtValue).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // Days until expiry
  const daysUntilExpiry = offer.daysUntilExpiry
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 3
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0

  // Candidate initials
  const candidateInitials = candidate
    ? `${candidate.first_name?.charAt(0) || ''}${candidate.last_name?.charAt(0) || ''}`
    : '?'

  // Format rate display
  const formatRate = (rate: number | null | undefined, rateType: string | null | undefined) => {
    if (!rate) return '-'
    const suffix = rateType === 'hourly' ? '/hr' : rateType === 'annual' ? '/yr' : ''
    return `$${rate.toLocaleString()}${suffix}`
  }

  return (
    <div className="bg-gradient-to-r from-charcoal-50 to-white border-b border-charcoal-200">
      {/* Main Context Bar */}
      <div className="px-6 py-4">
        <div className="flex items-start gap-6">
          {/* Offer Info */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gold-100">
              <Gift className="h-6 w-6 text-gold-700" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900">Offer</p>
              {employmentConfig && (
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1',
                  employmentConfig.bgColor,
                  employmentConfig.textColor
                )}>
                  {employmentConfig.label}
                </span>
              )}
              {sentAt && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Send className="h-3 w-3 text-charcoal-400" />
                  <span className="text-xs text-charcoal-500">Sent {sentAt}</span>
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Candidate Card */}
          <div className="flex items-start gap-3 min-w-[220px]">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={candidate?.avatar_url || undefined} alt={candidate?.full_name || ''} />
              <AvatarFallback className="bg-gold-100 text-gold-700 font-semibold text-sm">
                {candidateInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                href={`/employee/recruiting/candidates/${candidate?.id}`}
                className="font-medium text-charcoal-900 hover:text-gold-600 truncate text-sm block"
              >
                {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Unknown'}
              </Link>
              <p className="text-xs text-charcoal-500 truncate">{candidate?.title || 'Candidate'}</p>
              <div className="flex items-center gap-2 mt-1">
                {candidate?.email && (
                  <a href={`mailto:${candidate.email}`} className="text-charcoal-400 hover:text-gold-600">
                    <Mail className="h-3 w-3" />
                  </a>
                )}
                {candidate?.phone && (
                  <a href={`tel:${candidate.phone}`} className="text-charcoal-400 hover:text-gold-600">
                    <Phone className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Job + Account Card */}
          <div className="flex-1 min-w-[180px] max-w-[260px]">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-charcoal-400" />
              <Link
                href={`/employee/recruiting/jobs/${job?.id}`}
                className="font-medium text-charcoal-900 hover:text-gold-600 truncate text-sm"
              >
                {job?.title || 'Unknown Job'}
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="h-3.5 w-3.5 text-charcoal-400" />
              <Link
                href={`/employee/recruiting/accounts/${account?.id}`}
                className="text-xs text-charcoal-600 hover:text-gold-600 truncate"
              >
                {account?.name || 'Unknown Account'}
              </Link>
            </div>
            {submission && (
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-3.5 w-3.5 text-charcoal-400" />
                <Link
                  href={`/employee/recruiting/submissions/${submission.id}`}
                  className="text-xs text-charcoal-500 hover:text-gold-600"
                >
                  View Submission
                </Link>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Compensation Metrics */}
          <div className="flex items-center gap-6">
            {/* Bill Rate */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Bill</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {formatRate(offer.bill_rate as number | null | undefined, offer.rate_type as string | null | undefined)}
              </p>
            </div>

            {/* Pay Rate */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Pay</p>
              <p className="text-lg font-semibold text-charcoal-900">
                {formatRate(offer.pay_rate as number | null | undefined, offer.rate_type as string | null | undefined)}
              </p>
            </div>

            {/* Margin */}
            <div className="text-center">
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Margin</p>
              <p className={cn(
                'text-lg font-semibold',
                offer.marginPercent >= 20 ? 'text-green-600' :
                offer.marginPercent >= 10 ? 'text-amber-600' :
                'text-red-600'
              )}>
                {offer.marginPercent.toFixed(0)}%
              </p>
            </div>

            {/* Expiry */}
            {expiresAt && (
              <div className="text-center">
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">Expires</p>
                <p className={cn(
                  'text-sm font-medium',
                  isExpired ? 'text-red-600' :
                  isExpiringSoon ? 'text-amber-600' :
                  'text-charcoal-900'
                )}>
                  {isExpired ? 'Expired' :
                   daysUntilExpiry === 0 ? 'Today' :
                   daysUntilExpiry === 1 ? '1 day' :
                   `${daysUntilExpiry} days`}
                </p>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="h-14 w-px bg-charcoal-200" />

          {/* Status */}
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Status</p>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium',
                statusConfig.bgColor,
                statusConfig.textColor
              )}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {offerStatus === 'draft' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onQuickAction?.('send')}
                className="text-xs"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                Send
              </Button>
            )}
            {['sent', 'pending_response', 'negotiating'].includes(offerStatus) && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onQuickAction?.('accept')}
                className="text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Accept
              </Button>
            )}
            {!['accepted', 'declined', 'withdrawn', 'expired'].includes(offerStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuickAction?.('edit')}
                className="text-xs"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
