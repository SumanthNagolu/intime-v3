'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Loader2,
  MessageSquare,
  DollarSign,
  ArrowRight,
  Calendar,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'

// Negotiation form schema
const negotiationSchema = z.object({
  initiatedBy: z.enum(['candidate', 'client', 'recruiter']),
  proposedPayRate: z.number().positive().optional().nullable(),
  proposedBillRate: z.number().positive().optional().nullable(),
  proposedStartDate: z.string().optional(),
  proposedPtoDays: z.number().int().optional().nullable(),
  counterMessage: z.string().min(10, 'Please provide details about the counter-offer').max(2000),
})

type NegotiationFormData = z.infer<typeof negotiationSchema>

interface Negotiation {
  id: string
  initiated_by: string
  proposed_terms: Record<string, unknown> | null
  status: string
  created_at: string
}

interface OfferNegotiationPanelProps {
  offerId: string
  currentPayRate: number
  currentBillRate: number
  currentStartDate?: string
  negotiations: Negotiation[]
  offerStatus: string
  onNegotiationRecorded?: () => void
}

const INITIATED_BY_OPTIONS = [
  { value: 'candidate', label: 'Candidate', icon: User, color: 'blue' },
  { value: 'client', label: 'Client', icon: Building, color: 'purple' },
  { value: 'recruiter', label: 'Recruiter', icon: MessageSquare, color: 'green' },
]

export function OfferNegotiationPanel({
  offerId,
  currentPayRate,
  currentBillRate,
  currentStartDate,
  negotiations,
  offerStatus,
  onNegotiationRecorded,
}: OfferNegotiationPanelProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<NegotiationFormData>({
    resolver: zodResolver(negotiationSchema),
    defaultValues: {
      initiatedBy: 'candidate',
      proposedPayRate: null,
      proposedBillRate: null,
      proposedStartDate: '',
      proposedPtoDays: null,
      counterMessage: '',
    },
    mode: 'onChange',
  })

  const initiatedBy = watch('initiatedBy')
  const proposedPayRate = watch('proposedPayRate')
  const proposedBillRate = watch('proposedBillRate')

  const negotiateMutation = trpc.ats.offers.negotiate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Counter-offer recorded',
        description: 'The negotiation has been logged. Review and respond to the candidate.',
      })
      reset()
      setIsDialogOpen(false)
      onNegotiationRecorded?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to record negotiation',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: NegotiationFormData) => {
    negotiateMutation.mutate({
      offerId,
      initiatedBy: data.initiatedBy,
      proposedPayRate: data.proposedPayRate ?? undefined,
      proposedBillRate: data.proposedBillRate ?? undefined,
      proposedStartDate: data.proposedStartDate || undefined,
      proposedPtoDays: data.proposedPtoDays ?? undefined,
      counterMessage: data.counterMessage,
    })
  }

  const canNegotiate = ['sent', 'pending_response', 'negotiating'].includes(offerStatus)

  // Calculate proposed margin if rates are changed
  const proposedMargin = proposedBillRate && proposedPayRate
    ? (((proposedBillRate - proposedPayRate) / proposedBillRate) * 100).toFixed(1)
    : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            Negotiation History
          </CardTitle>
          <CardDescription>
            Track counter-offers and negotiation discussions
          </CardDescription>
        </div>
        {canNegotiate && (
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Record Counter-Offer
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {negotiations.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No negotiations recorded yet</p>
            {canNegotiate && (
              <p className="text-sm mt-1">Click &quot;Record Counter-Offer&quot; when the candidate or client responds</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {negotiations.map((negotiation, index) => {
              const initiator = INITIATED_BY_OPTIONS.find(o => o.value === negotiation.initiated_by)
              const Icon = initiator?.icon || MessageSquare
              const proposedTerms = negotiation.proposed_terms as Record<string, number | string> | null

              return (
                <div
                  key={negotiation.id}
                  className={cn(
                    'relative border-l-2 pl-4 pb-4',
                    index === negotiations.length - 1 ? 'border-gold-500' : 'border-charcoal-200'
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'absolute -left-2 top-0 w-4 h-4 rounded-full',
                      index === negotiations.length - 1 ? 'bg-gold-500' : 'bg-charcoal-300'
                    )}
                  />

                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      initiator?.color === 'blue' ? 'bg-blue-100' :
                      initiator?.color === 'purple' ? 'bg-purple-100' :
                      'bg-green-100'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        initiator?.color === 'blue' ? 'text-blue-600' :
                        initiator?.color === 'purple' ? 'text-purple-600' :
                        'text-green-600'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-charcoal-900">
                          {initiator?.label || 'Unknown'} Counter-Offer
                        </span>
                        <span className="text-xs text-charcoal-500">
                          {formatDistanceToNow(new Date(negotiation.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Proposed Changes */}
                      {proposedTerms && Object.keys(proposedTerms).length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          {proposedTerms.pay_rate && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3 text-charcoal-400" />
                              <span className="text-charcoal-600">Pay:</span>
                              <span className="font-medium">${currentPayRate}</span>
                              <ArrowRight className="w-3 h-3 text-charcoal-400" />
                              <span className="font-medium text-amber-600">
                                ${proposedTerms.pay_rate}
                              </span>
                            </div>
                          )}
                          {proposedTerms.bill_rate && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-3 h-3 text-charcoal-400" />
                              <span className="text-charcoal-600">Bill:</span>
                              <span className="font-medium">${currentBillRate}</span>
                              <ArrowRight className="w-3 h-3 text-charcoal-400" />
                              <span className="font-medium text-amber-600">
                                ${proposedTerms.bill_rate}
                              </span>
                            </div>
                          )}
                          {proposedTerms.start_date && (
                            <div className="flex items-center gap-2 col-span-2">
                              <Calendar className="w-3 h-3 text-charcoal-400" />
                              <span className="text-charcoal-600">Start Date:</span>
                              <span className="font-medium text-amber-600">
                                {proposedTerms.start_date as string}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <Badge
                        variant={
                          negotiation.status === 'accepted' ? 'default' :
                          negotiation.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                        className="mt-2"
                      >
                        {negotiation.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
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

      {/* Record Negotiation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Counter-Offer</DialogTitle>
            <DialogDescription>
              Log a counter-offer or negotiation request from the candidate or client
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Who initiated */}
            <div className="space-y-2">
              <Label>Who initiated this counter-offer?</Label>
              <div className="grid grid-cols-3 gap-2">
                {INITIATED_BY_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setValue('initiatedBy', option.value as 'candidate' | 'client' | 'recruiter')}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-colors',
                        initiatedBy === option.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 mx-auto mb-1',
                        option.color === 'blue' ? 'text-blue-600' :
                        option.color === 'purple' ? 'text-purple-600' :
                        'text-green-600'
                      )} />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Proposed Rate Changes */}
            <div className="space-y-3">
              <Label>Proposed Rate Changes (if any)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">New Pay Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-charcoal-400 text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('proposedPayRate', { valueAsNumber: true })}
                      className="pl-7"
                      placeholder={currentPayRate.toString()}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-charcoal-500">New Bill Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-charcoal-400 text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register('proposedBillRate', { valueAsNumber: true })}
                      className="pl-7"
                      placeholder={currentBillRate.toString()}
                    />
                  </div>
                </div>
              </div>

              {/* Margin Impact */}
              {proposedMargin && (
                <div className={cn(
                  'p-2 rounded-lg text-sm flex items-center justify-between',
                  parseFloat(proposedMargin) < 10 ? 'bg-red-50 text-red-700' :
                  parseFloat(proposedMargin) < 15 ? 'bg-amber-50 text-amber-700' :
                  'bg-green-50 text-green-700'
                )}>
                  <span>Proposed Margin:</span>
                  <span className="font-medium">{proposedMargin}%</span>
                </div>
              )}
            </div>

            {/* Proposed Start Date */}
            <div className="space-y-2">
              <Label>Proposed Start Date (if different)</Label>
              <Input
                type="date"
                {...register('proposedStartDate')}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* Counter Message */}
            <div className="space-y-2">
              <Label>Counter-Offer Details *</Label>
              <Textarea
                {...register('counterMessage')}
                placeholder="Describe the counter-offer or negotiation request in detail..."
                rows={4}
                className="resize-none"
              />
              {errors.counterMessage && (
                <p className="text-sm text-red-500">{errors.counterMessage.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={negotiateMutation.isPending || !isValid}>
                {negotiateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Negotiation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
