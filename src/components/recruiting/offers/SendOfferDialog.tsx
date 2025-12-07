'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Send,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

// Form schema
const sendOfferSchema = z.object({
  personalNote: z.string().max(1000).optional(),
  expiresAt: z.string().optional(),
  notifyHiringManager: z.boolean(),
  notifyPodManager: z.boolean(),
})

type SendOfferFormData = z.infer<typeof sendOfferSchema>

interface OfferDetails {
  id: string
  payRate: number
  billRate: number
  rateType: string
  startDate: string
  endDate?: string
  employmentType: string
  workLocation: string
  ptoDays?: number
  healthInsurance?: boolean
}

interface SendOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer: OfferDetails
  candidateName: string
  candidateEmail: string
  jobTitle: string
  accountName: string
  hiringManagerName?: string
  onSuccess?: () => void
}

const EXPIRATION_OPTIONS = [
  { value: 3, label: '3 days' },
  { value: 5, label: '5 days' },
  { value: 7, label: '7 days (recommended)' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
]

export function SendOfferDialog({
  open,
  onOpenChange,
  offer,
  candidateName,
  candidateEmail,
  jobTitle,
  accountName,
  hiringManagerName,
  onSuccess,
}: SendOfferDialogProps) {
  const { toast } = useToast()
  const [expirationDays, setExpirationDays] = useState(7)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendOfferFormData>({
    resolver: zodResolver(sendOfferSchema),
    defaultValues: {
      personalNote: '',
      expiresAt: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
      notifyHiringManager: true,
      notifyPodManager: true,
    },
  })

  const notifyHiringManager = watch('notifyHiringManager')
  const notifyPodManager = watch('notifyPodManager')

  // Calculate margin
  const marginAmount = offer.billRate - offer.payRate
  const marginPercent = offer.billRate > 0 ? ((marginAmount / offer.billRate) * 100).toFixed(1) : '0.0'

  const sendOfferMutation = trpc.ats.offers.send.useMutation({
    onSuccess: () => {
      toast({
        title: 'Offer sent successfully',
        description: `Offer sent to ${candidateName} at ${candidateEmail}`,
      })
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to send offer',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: SendOfferFormData) => {
    sendOfferMutation.mutate({
      offerId: offer.id,
      personalNote: data.personalNote || undefined,
      expiresAt: data.expiresAt || undefined,
      notifyHiringManager: data.notifyHiringManager,
      notifyPodManager: data.notifyPodManager,
    })
  }

  const handleExpirationChange = (days: number) => {
    setExpirationDays(days)
    setValue('expiresAt', format(addDays(new Date(), days), "yyyy-MM-dd'T'HH:mm"))
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-gold-500" />
            Send Offer
          </DialogTitle>
          <DialogDescription>
            Send this offer to <span className="font-medium text-charcoal-900">{candidateName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Offer Summary */}
          <Card className="bg-cream">
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-charcoal-500" />
                  <span className="text-charcoal-600">Candidate</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-charcoal-900">{candidateName}</div>
                  <div className="text-xs text-charcoal-500">{candidateEmail}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-charcoal-500" />
                  <span className="text-charcoal-600">Position</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-charcoal-900">{jobTitle}</div>
                  <div className="text-xs text-charcoal-500">{accountName}</div>
                </div>
              </div>
              <div className="border-t pt-3 mt-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Pay Rate</span>
                  <span className="font-medium">${offer.payRate}/{offer.rateType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Bill Rate</span>
                  <span className="font-medium">${offer.billRate}/{offer.rateType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Margin</span>
                  <span className="font-medium text-green-600">{marginPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Start Date</span>
                  <span className="font-medium">{format(new Date(offer.startDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">{offer.employmentType.toUpperCase()}</Badge>
                <Badge variant="outline">{offer.workLocation}</Badge>
                {offer.ptoDays && <Badge variant="outline">{offer.ptoDays} PTO days</Badge>}
                {offer.healthInsurance && <Badge variant="outline">Health Insurance</Badge>}
              </div>
            </CardContent>
          </Card>

          {/* Expiration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-charcoal-500" />
              Offer Expiration
            </Label>
            <div className="flex flex-wrap gap-2">
              {EXPIRATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleExpirationChange(option.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                    expirationDays === option.value
                      ? 'border-hublot-900 bg-hublot-50 text-hublot-900'
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-charcoal-500">
              Offer will expire on {format(addDays(new Date(), expirationDays), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Personal Note */}
          <div className="space-y-2">
            <Label htmlFor="personalNote">Personal Note (Optional)</Label>
            <Textarea
              id="personalNote"
              {...register('personalNote')}
              placeholder="Add a personal message to the candidate..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-charcoal-500">
              This will be included in the offer email to the candidate
            </p>
          </div>

          {/* Notifications */}
          <Card>
            <CardContent className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Notify Hiring Manager</Label>
                  <p className="text-sm text-charcoal-500">
                    {hiringManagerName || 'Hiring manager will be notified'}
                  </p>
                </div>
                <Switch
                  checked={notifyHiringManager}
                  onCheckedChange={(checked) => setValue('notifyHiringManager', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Notify Pod Manager</Label>
                  <p className="text-sm text-charcoal-500">Your pod manager will be copied</p>
                </div>
                <Switch
                  checked={notifyPodManager}
                  onCheckedChange={(checked) => setValue('notifyPodManager', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning if margin is low */}
          {parseFloat(marginPercent) < 15 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Low Margin Notice</p>
                <p className="text-xs text-amber-600">
                  This offer has a {marginPercent}% margin. Ensure this has been approved.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sendOfferMutation.isPending}>
              {sendOfferMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Offer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
