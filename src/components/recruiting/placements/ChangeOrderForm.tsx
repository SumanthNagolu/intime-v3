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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Loader2,
  FileEdit,
  Calendar,
  DollarSign,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// Change order form schema
const changeOrderSchema = z.object({
  changeType: z.enum(['extension', 'rate_change', 'hours_change', 'role_change', 'location_change', 'other']),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  newEndDate: z.string().optional(),
  newBillRate: z.number().positive().optional().nullable(),
  newPayRate: z.number().positive().optional().nullable(),
  newHoursPerWeek: z.number().positive().max(60).optional().nullable(),
  reason: z.string().min(1, 'Reason is required').max(1000),
  notes: z.string().max(2000).optional(),
})

type ChangeOrderFormData = z.infer<typeof changeOrderSchema>

interface ChangeOrderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placementId: string
  candidateName: string
  jobTitle: string
  accountName: string
  currentEndDate?: string
  currentPayRate: number
  currentBillRate: number
  currentHoursPerWeek?: number
  onSuccess?: () => void
}

const CHANGE_TYPES = [
  { value: 'extension', label: 'Extension', icon: Calendar, description: 'Extend the placement duration' },
  { value: 'rate_change', label: 'Rate Change', icon: DollarSign, description: 'Modify pay or bill rates' },
  { value: 'hours_change', label: 'Hours Change', icon: Clock, description: 'Change expected weekly hours' },
  { value: 'role_change', label: 'Role Change', icon: FileText, description: 'Modify role or responsibilities' },
  { value: 'location_change', label: 'Location Change', icon: FileText, description: 'Change work location' },
  { value: 'other', label: 'Other', icon: FileEdit, description: 'Other modification' },
] as const

export function ChangeOrderForm({
  open,
  onOpenChange,
  placementId,
  candidateName,
  jobTitle,
  accountName,
  currentEndDate,
  currentPayRate,
  currentBillRate,
  currentHoursPerWeek = 40,
  onSuccess,
}: ChangeOrderFormProps) {
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ChangeOrderFormData>({
    resolver: zodResolver(changeOrderSchema),
    defaultValues: {
      changeType: 'extension',
      effectiveDate: format(new Date(), 'yyyy-MM-dd'),
      newEndDate: '',
      newBillRate: null,
      newPayRate: null,
      newHoursPerWeek: null,
      reason: '',
      notes: '',
    },
    mode: 'onChange',
  })

  const changeType = watch('changeType')
  const newPayRate = watch('newPayRate')
  const newBillRate = watch('newBillRate')
  const newEndDate = watch('newEndDate')

  // Calculate margin impact
  const currentMargin = ((currentBillRate - currentPayRate) / currentBillRate * 100).toFixed(1)
  const proposedPayRate = newPayRate || currentPayRate
  const proposedBillRate = newBillRate || currentBillRate
  const proposedMargin = proposedBillRate > 0
    ? ((proposedBillRate - proposedPayRate) / proposedBillRate * 100).toFixed(1)
    : '0.0'

  const createMutation = trpc.ats.placements.createChangeOrder.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Change order created',
        description: 'The change order has been submitted for approval.',
      })
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to create change order',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const onSubmit = (data: ChangeOrderFormData) => {
    createMutation.mutate({
      placementId,
      changeType: data.changeType,
      effectiveDate: data.effectiveDate,
      newEndDate: data.newEndDate || undefined,
      newBillRate: data.newBillRate || undefined,
      newPayRate: data.newPayRate || undefined,
      newHoursPerWeek: data.newHoursPerWeek || undefined,
      reason: data.reason,
      notes: data.notes || undefined,
    })
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  const showRateFields = changeType === 'rate_change' || changeType === 'extension'
  const showEndDateField = changeType === 'extension'
  const showHoursField = changeType === 'hours_change'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-gold-500" />
            Create Change Order
          </DialogTitle>
          <DialogDescription>
            Request a modification to <span className="font-medium text-charcoal-900">{candidateName}</span>&apos;s
            placement at <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Status */}
          <Card className="bg-charcoal-50">
            <CardContent className="py-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-500">Position</span>
                  <p className="font-medium">{jobTitle}</p>
                </div>
                <div>
                  <span className="text-charcoal-500">Current End Date</span>
                  <p className="font-medium">
                    {currentEndDate ? format(new Date(currentEndDate), 'MMM d, yyyy') : 'Ongoing'}
                  </p>
                </div>
                <div>
                  <span className="text-charcoal-500">Current Margin</span>
                  <p className="font-medium text-green-600">{currentMargin}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Type */}
          <div className="space-y-2">
            <Label>Change Type *</Label>
            <Select
              value={changeType}
              onValueChange={(value) => setValue('changeType', value as ChangeOrderFormData['changeType'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select change type" />
              </SelectTrigger>
              <SelectContent>
                {CHANGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-charcoal-500" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">
              {CHANGE_TYPES.find(t => t.value === changeType)?.description}
            </p>
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label>Effective Date *</Label>
            <Input
              type="date"
              {...register('effectiveDate')}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            {errors.effectiveDate && (
              <p className="text-sm text-red-500">{errors.effectiveDate.message}</p>
            )}
          </div>

          {/* End Date (for extensions) */}
          {showEndDateField && (
            <div className="space-y-2">
              <Label>New End Date</Label>
              <Input
                type="date"
                {...register('newEndDate')}
                min={currentEndDate || format(new Date(), 'yyyy-MM-dd')}
              />
              {newEndDate && currentEndDate && (
                <p className="text-sm text-charcoal-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Extending from {format(new Date(currentEndDate), 'MMM d, yyyy')} to{' '}
                  {format(new Date(newEndDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          )}

          {/* Rate Changes */}
          {showRateFields && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Rate Changes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">New Pay Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-charcoal-400 text-sm">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('newPayRate', { valueAsNumber: true })}
                        className="pl-7"
                        placeholder={currentPayRate.toString()}
                      />
                    </div>
                    <p className="text-xs text-charcoal-400">Current: ${currentPayRate}/hr</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">New Bill Rate</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-charcoal-400 text-sm">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('newBillRate', { valueAsNumber: true })}
                        className="pl-7"
                        placeholder={currentBillRate.toString()}
                      />
                    </div>
                    <p className="text-xs text-charcoal-400">Current: ${currentBillRate}/hr</p>
                  </div>
                </div>

                {/* Margin Impact */}
                {(newPayRate || newBillRate) && (
                  <div className={cn(
                    'p-3 rounded-lg text-sm flex items-center justify-between',
                    parseFloat(proposedMargin) < 10 ? 'bg-red-50 text-red-700' :
                    parseFloat(proposedMargin) < 15 ? 'bg-amber-50 text-amber-700' :
                    'bg-green-50 text-green-700'
                  )}>
                    <span>Proposed Margin:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-charcoal-500">{currentMargin}%</span>
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium">{proposedMargin}%</span>
                    </div>
                  </div>
                )}

                {(newPayRate || newBillRate) && parseFloat(proposedMargin) < 10 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Warning: Margin below 10% threshold
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hours Change */}
          {showHoursField && (
            <div className="space-y-2">
              <Label>New Hours Per Week</Label>
              <Input
                type="number"
                step="0.5"
                min="1"
                max="60"
                {...register('newHoursPerWeek', { valueAsNumber: true })}
                placeholder={currentHoursPerWeek.toString()}
              />
              <p className="text-xs text-charcoal-400">Current: {currentHoursPerWeek} hours/week</p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              {...register('reason')}
              placeholder="Explain the reason for this change..."
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea
              {...register('notes')}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              Pending Approval
            </Badge>
            <span className="text-sm text-amber-700">
              This change order will require approval before being applied.
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Change Order
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
