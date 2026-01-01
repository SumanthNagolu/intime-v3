'use client'

/**
 * PCF-Compatible Section Components for Offers
 *
 * Uses ONE database call pattern - data comes from context via entity prop
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  Calendar,
  Briefcase,
  User,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  Plus,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'
import type { FullOffer, OfferNegotiation, OfferApproval } from '@/types/offer'
import { OFFER_STATUS_CONFIG, OFFER_EMPLOYMENT_TYPE_CONFIG } from '@/configs/entities/offers.config'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

// PCF-compatible props interface
interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

// ============================================================================
// OVERVIEW SECTION
// ============================================================================
export function OfferOverviewSection({ entityId: _entityId, entity }: PCFSectionProps) {
  const offer = entity as FullOffer | undefined

  if (!offer) return null

  const candidate = offer.submission?.candidate
  const job = offer.submission?.job || offer.job
  const account = offer.account

  const statusConfig = OFFER_STATUS_CONFIG[offer.status as string] || {
    label: offer.status,
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
  }

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return '-'
    const rateType = offer.rate_type as string | null | undefined
    const suffix = rateType === 'hourly' ? '/hr' : rateType === 'annual' ? '/yr' : ''
    return `$${rate.toLocaleString()}${suffix}`
  }

  return (
    <div className="space-y-6">
      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Offer Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {['draft', 'sent', 'pending_response', 'accepted'].map((status, index) => {
              const isActive = offer.status === status
              const currentIndex = ['draft', 'sent', 'pending_response', 'accepted'].indexOf(offer.status as string)
              const isPast = currentIndex > index
              const config = OFFER_STATUS_CONFIG[status]

              return (
                <div key={status} className="flex items-center">
                  <div className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium',
                    isPast ? 'bg-green-100 text-green-700' :
                    isActive ? cn(config?.bgColor, config?.textColor) :
                    'bg-charcoal-100 text-charcoal-500'
                  )}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={cn(
                    'ml-2 text-sm',
                    isActive ? 'font-medium text-charcoal-900' : 'text-charcoal-500'
                  )}>
                    {config?.label || status}
                  </span>
                  {index < 3 && (
                    <ArrowRight className="w-4 h-4 mx-3 text-charcoal-300" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Offer Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Candidate</p>
              <Link
                href={`/employee/recruiting/candidates/${candidate?.id}`}
                className="font-medium text-charcoal-900 hover:text-gold-600"
              >
                {candidate ? `${candidate.first_name} ${candidate.last_name}` : '-'}
              </Link>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Status</p>
              <Badge className={cn(statusConfig.bgColor, statusConfig.textColor)}>
                {statusConfig.label}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Position</p>
              <Link
                href={`/employee/recruiting/jobs/${job?.id}`}
                className="font-medium text-charcoal-900 hover:text-gold-600"
              >
                {job?.title || '-'}
              </Link>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Client</p>
              <Link
                href={`/employee/recruiting/accounts/${account?.id}`}
                className="font-medium text-charcoal-900 hover:text-gold-600"
              >
                {account?.name || '-'}
              </Link>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Bill Rate</p>
              <p className="font-medium text-charcoal-900">{formatRate(offer.bill_rate as number | null | undefined)}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Pay Rate</p>
              <p className="font-medium text-charcoal-900">{formatRate(offer.pay_rate as number | null | undefined)}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Start Date</p>
              <p className="font-medium text-charcoal-900">
                {offer.start_date ? format(new Date(offer.start_date as string), 'MMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Margin</p>
              <p className={cn(
                'font-medium',
                offer.marginPercent >= 20 ? 'text-green-600' :
                offer.marginPercent >= 10 ? 'text-amber-600' :
                'text-red-600'
              )}>
                {offer.marginPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// TERMS SECTION
// ============================================================================
export function OfferTermsSection({ entityId: _entityId, entity }: PCFSectionProps) {
  const offer = entity as FullOffer | undefined
  const router = useRouter()

  if (!offer) return null

  const employmentType = offer.employment_type as string | null | undefined
  const employmentConfig = employmentType ? OFFER_EMPLOYMENT_TYPE_CONFIG[employmentType] : null

  const formatRate = (rate: number | null | undefined) => {
    if (!rate) return '-'
    const rateType = offer.rate_type as string | null | undefined
    const suffix = rateType === 'hourly' ? '/hr' : rateType === 'annual' ? '/yr' : ''
    return `$${rate.toLocaleString()}${suffix}`
  }

  const handleEdit = () => {
    router.push(`/employee/recruiting/submissions/${offer.submission_id}/extend-offer`)
  }

  return (
    <div className="space-y-6">
      {/* Compensation Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gold-500" />
            Compensation
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Employment Type</p>
              {employmentConfig ? (
                <Badge className={cn(employmentConfig.bgColor, employmentConfig.textColor)}>
                  {employmentConfig.label}
                </Badge>
              ) : (
                <p className="font-medium text-charcoal-900">-</p>
              )}
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Rate Type</p>
              <p className="font-medium text-charcoal-900 capitalize">{(offer.rate_type as string) || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Bill Rate</p>
              <p className="font-medium text-charcoal-900">{formatRate(offer.bill_rate as number | null | undefined)}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Pay Rate</p>
              <p className="font-medium text-charcoal-900">{formatRate(offer.pay_rate as number | null | undefined)}</p>
            </div>
            {(offer.overtime_rate as number | null | undefined) && (
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wide">Overtime Rate</p>
                <p className="font-medium text-charcoal-900">${String(offer.overtime_rate)}/hr</p>
              </div>
            )}
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Gross Margin</p>
              <p className={cn(
                'font-semibold',
                offer.marginPercent >= 20 ? 'text-green-600' :
                offer.marginPercent >= 10 ? 'text-amber-600' :
                'text-red-600'
              )}>
                {offer.marginPercent.toFixed(1)}% (${offer.marginAmount.toFixed(2)}/hr)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-gold-500" />
            Benefits
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">PTO Days</p>
              <p className="font-medium text-charcoal-900">{(offer.pto_days as number | null | undefined) ?? '-'} days</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Sick Days</p>
              <p className="font-medium text-charcoal-900">{(offer.sick_days as number | null | undefined) ?? '-'} days</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Health Insurance</p>
              <p className="font-medium text-charcoal-900">
                {offer.health_insurance ? 'Included' : 'Not Included'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">401(k)</p>
              <p className="font-medium text-charcoal-900">
                {offer.has_401k ? 'Included' : 'Not Included'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-500" />
            Start Details
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Start Date</p>
              <p className="font-medium text-charcoal-900">
                {offer.start_date ? format(new Date(offer.start_date as string), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">End Date</p>
              <p className="font-medium text-charcoal-900">
                {offer.end_date ? format(new Date(offer.end_date as string), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Duration</p>
              <p className="font-medium text-charcoal-900">
                {offer.duration_months ? `${offer.duration_months} months` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Work Location</p>
              <p className="font-medium text-charcoal-900 capitalize">{(offer.work_location as string) || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Hours/Week</p>
              <p className="font-medium text-charcoal-900">
                {offer.standard_hours_per_week ? `${offer.standard_hours_per_week} hrs` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wide">Expires</p>
              <p className={cn(
                'font-medium',
                offer.daysUntilExpiry !== null && offer.daysUntilExpiry < 0 ? 'text-red-600' :
                offer.daysUntilExpiry !== null && offer.daysUntilExpiry <= 3 ? 'text-amber-600' :
                'text-charcoal-900'
              )}>
                {offer.expires_at ? format(new Date(offer.expires_at as string), 'MMMM d, yyyy') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// NEGOTIATION SECTION
// ============================================================================
const INITIATED_BY_CONFIG = {
  candidate: { label: 'Candidate', color: 'blue', icon: User },
  client: { label: 'Client', color: 'purple', icon: Building2 },
  recruiter: { label: 'Recruiter', color: 'green', icon: Briefcase },
}

export function OfferNegotiationSection({ entityId: _entityId, entity }: PCFSectionProps) {
  const offer = entity as FullOffer | undefined
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    initiatedBy: 'candidate' as 'candidate' | 'client' | 'recruiter',
    proposedPayRate: '',
    proposedBillRate: '',
    counterMessage: '',
  })

  if (!offer) return null

  const negotiations = offer.sections?.negotiations?.items || []
  const canNegotiate = ['sent', 'pending_response', 'negotiating'].includes(offer.status as string)

  const negotiateMutation = trpc.ats.offers.negotiate.useMutation({
    onSuccess: () => {
      toast({ title: 'Counter-offer recorded', description: 'The negotiation has been logged.' })
      setShowForm(false)
      setFormData({ initiatedBy: 'candidate', proposedPayRate: '', proposedBillRate: '', counterMessage: '' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleSubmit = () => {
    negotiateMutation.mutate({
      offerId: offer.id as string,
      initiatedBy: formData.initiatedBy,
      proposedPayRate: formData.proposedPayRate ? parseFloat(formData.proposedPayRate) : undefined,
      proposedBillRate: formData.proposedBillRate ? parseFloat(formData.proposedBillRate) : undefined,
      counterMessage: formData.counterMessage,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold-500" />
              Negotiation History
            </CardTitle>
            <CardDescription>Track counter-offers and negotiation discussions</CardDescription>
          </div>
          {canNegotiate && !showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Record Counter-Offer
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Inline Form */}
          {showForm && (
            <div className="mb-6 p-4 border border-charcoal-200 rounded-lg bg-charcoal-50">
              <h4 className="font-medium mb-4">Record Counter-Offer</h4>

              <div className="space-y-4">
                {/* Initiated By */}
                <div>
                  <Label>Who initiated?</Label>
                  <div className="flex gap-2 mt-2">
                    {Object.entries(INITIATED_BY_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, initiatedBy: key as 'candidate' | 'client' | 'recruiter' }))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-md border text-sm',
                          formData.initiatedBy === key
                            ? 'border-hublot-900 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Proposed Rates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Proposed Pay Rate</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-charcoal-400">$</span>
                      <input
                        type="number"
                        value={formData.proposedPayRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, proposedPayRate: e.target.value }))}
                        className="w-full pl-7 pr-3 py-2 border border-charcoal-200 rounded-md"
                        placeholder={String(offer.pay_rate || '')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Proposed Bill Rate</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-charcoal-400">$</span>
                      <input
                        type="number"
                        value={formData.proposedBillRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, proposedBillRate: e.target.value }))}
                        className="w-full pl-7 pr-3 py-2 border border-charcoal-200 rounded-md"
                        placeholder={String(offer.bill_rate || '')}
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <Label>Details *</Label>
                  <Textarea
                    value={formData.counterMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, counterMessage: e.target.value }))}
                    placeholder="Describe the counter-offer..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.counterMessage || negotiateMutation.isPending}
                  >
                    {negotiateMutation.isPending ? 'Recording...' : 'Record'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {negotiations.length === 0 ? (
            <div className="text-center py-8 text-charcoal-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No negotiations recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {negotiations.map((negotiation: OfferNegotiation, index: number) => {
                const config = INITIATED_BY_CONFIG[negotiation.initiated_by as keyof typeof INITIATED_BY_CONFIG]
                const Icon = config?.icon || MessageSquare
                const proposedTerms = negotiation.proposed_terms as Record<string, number> | null

                return (
                  <div
                    key={negotiation.id}
                    className={cn(
                      'relative border-l-2 pl-4 pb-4',
                      index === 0 ? 'border-gold-500' : 'border-charcoal-200'
                    )}
                  >
                    <div className={cn(
                      'absolute -left-2 top-0 w-4 h-4 rounded-full',
                      index === 0 ? 'bg-gold-500' : 'bg-charcoal-300'
                    )} />

                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        config?.color === 'blue' ? 'bg-blue-100' :
                        config?.color === 'purple' ? 'bg-purple-100' :
                        'bg-green-100'
                      )}>
                        <Icon className={cn(
                          'w-4 h-4',
                          config?.color === 'blue' ? 'text-blue-600' :
                          config?.color === 'purple' ? 'text-purple-600' :
                          'text-green-600'
                        )} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-charcoal-900">
                            {config?.label || 'Unknown'} Counter-Offer
                          </span>
                          <span className="text-xs text-charcoal-500">
                            {formatDistanceToNow(new Date(negotiation.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {proposedTerms && Object.keys(proposedTerms).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-4 text-sm">
                            {proposedTerms.pay_rate && (
                              <div className="flex items-center gap-1">
                                <span className="text-charcoal-500">Pay:</span>
                                <span className="font-medium">${String(offer.pay_rate)}</span>
                                <ArrowRight className="w-3 h-3 text-charcoal-400" />
                                <span className="font-medium text-amber-600">${proposedTerms.pay_rate}</span>
                              </div>
                            )}
                            {proposedTerms.bill_rate && (
                              <div className="flex items-center gap-1">
                                <span className="text-charcoal-500">Bill:</span>
                                <span className="font-medium">${String(offer.bill_rate)}</span>
                                <ArrowRight className="w-3 h-3 text-charcoal-400" />
                                <span className="font-medium text-amber-600">${proposedTerms.bill_rate}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {negotiation.counter_message && (
                          <p className="mt-2 text-sm text-charcoal-600">{negotiation.counter_message}</p>
                        )}

                        <Badge
                          variant={
                            negotiation.status === 'accepted' ? 'default' :
                            negotiation.status === 'rejected' ? 'destructive' :
                            'secondary'
                          }
                          className="mt-2"
                        >
                          {negotiation.status === 'accepted' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {negotiation.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                          {negotiation.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {negotiation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// APPROVALS SECTION
// ============================================================================
const APPROVAL_TYPE_CONFIG = {
  rate_exception: { label: 'Rate Exception', color: 'amber' },
  terms_change: { label: 'Terms Change', color: 'blue' },
  budget_override: { label: 'Budget Override', color: 'purple' },
}

export function OfferApprovalsSection({ entityId: _entityId, entity }: PCFSectionProps) {
  const offer = entity as FullOffer | undefined
  const { toast } = useToast()
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseNotes, setResponseNotes] = useState('')

  if (!offer) return null

  const approvals = offer.sections?.approvals?.items || []

  const respondMutation = trpc.ats.offers.respondToApproval.useMutation({
    onSuccess: (_, variables) => {
      toast({
        title: `Approval ${variables.approved ? 'approved' : 'rejected'}`,
        description: `The request has been ${variables.approved ? 'approved' : 'rejected'}.`,
      })
      setRespondingTo(null)
      setResponseNotes('')
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const handleRespond = (approvalId: string, approved: boolean) => {
    respondMutation.mutate({
      approvalId,
      approved,
      responseNotes: responseNotes || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold-500" />
            Approval Workflow
          </CardTitle>
          <CardDescription>Rate exceptions and terms change approvals</CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8 text-charcoal-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No approval requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval: OfferApproval) => {
                const typeConfig = APPROVAL_TYPE_CONFIG[approval.approval_type as keyof typeof APPROVAL_TYPE_CONFIG]
                const isPending = approval.status === 'pending'
                const isResponding = respondingTo === approval.id

                return (
                  <div
                    key={approval.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      isPending ? 'border-amber-200 bg-amber-50' : 'border-charcoal-200'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {/* Requester Avatar */}
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={approval.requester?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {approval.requester?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-charcoal-900">
                              {typeConfig?.label || approval.approval_type}
                            </span>
                            <Badge
                              variant={
                                approval.status === 'approved' ? 'default' :
                                approval.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {approval.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {approval.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {approval.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {approval.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-charcoal-600 mt-1">
                            Requested by {approval.requester?.full_name || 'Unknown'}
                          </p>

                          {approval.request_notes && (
                            <p className="text-sm text-charcoal-500 mt-2">
                              &quot;{approval.request_notes}&quot;
                            </p>
                          )}

                          {approval.proposed_changes && typeof approval.proposed_changes === 'object' && Object.keys(approval.proposed_changes as object).length > 0 && (
                            <div className="mt-2 p-2 bg-white rounded border border-charcoal-100">
                              <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">Proposed Changes</p>
                              <pre className="text-xs text-charcoal-700">
                                {JSON.stringify(approval.proposed_changes, null, 2)}
                              </pre>
                            </div>
                          )}

                          {approval.responded_at && (
                            <p className="text-xs text-charcoal-400 mt-2">
                              Responded {formatDistanceToNow(new Date(approval.responded_at), { addSuffix: true })}
                              {approval.approver && ` by ${approval.approver.full_name}`}
                            </p>
                          )}

                          {approval.response_notes && (
                            <p className="text-sm text-charcoal-500 mt-1 italic">
                              Response: &quot;{approval.response_notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {isPending && !isResponding && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRespondingTo(approval.id)}
                        >
                          Respond
                        </Button>
                      )}
                    </div>

                    {/* Response Form */}
                    {isResponding && (
                      <div className="mt-4 p-3 bg-white rounded border border-charcoal-200">
                        <Label>Response Notes (optional)</Label>
                        <Textarea
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                          placeholder="Add notes about your decision..."
                          rows={2}
                          className="mt-1"
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setRespondingTo(null); setResponseNotes('') }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRespond(approval.id, false)}
                            disabled={respondMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRespond(approval.id, true)}
                            disabled={respondMutation.isPending}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
