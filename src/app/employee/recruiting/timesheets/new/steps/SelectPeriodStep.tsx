'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { ChevronRight, ChevronLeft, Search, Building2, User, Briefcase, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TimesheetFormData,
  PeriodType,
  PERIOD_TYPES,
  calculatePeriodDates,
} from '@/stores/timesheet-entry-store'
import { trpc } from '@/lib/trpc/client'
import { format, parseISO } from 'date-fns'

interface StepProps {
  formData: TimesheetFormData
  setFormData: (data: Partial<TimesheetFormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onCancel: () => void
  isFirst: boolean
  isLast: boolean
  isSubmitting: boolean
}

interface Placement {
  id: string
  candidateName: string
  jobTitle: string
  accountName: string
  billRate: number
  payRate: number
  status: string
  startDate: string
  endDate: string | null
}

export function SelectPeriodStep({
  formData,
  setFormData,
  onNext,
  onCancel,
}: StepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null)

  // Fetch active placements for the user
  const { data: placementsData, isLoading: isLoadingPlacements } = trpc.timesheets.getActivePlacements.useQuery({
    search: searchTerm || undefined,
  })

  const placements = placementsData?.items || []

  // When a placement is selected from existing formData, set it
  useEffect(() => {
    if (formData.placementId && placements.length > 0) {
      const existing = placements.find(p => p.id === formData.placementId)
      if (existing) {
        setSelectedPlacement(existing)
      }
    }
  }, [formData.placementId, placements])

  const handlePlacementSelect = (placement: Placement) => {
    setSelectedPlacement(placement)
    setFormData({
      placementId: placement.id,
      candidateName: placement.candidateName,
      jobTitle: placement.jobTitle,
      accountName: placement.accountName,
      billRate: placement.billRate,
      payRate: placement.payRate,
    })
  }

  const handlePeriodTypeChange = (periodType: PeriodType) => {
    const { start, end } = calculatePeriodDates(periodType)
    setFormData({
      periodType,
      periodStart: start,
      periodEnd: end,
    })
  }

  const handleDateChange = (field: 'periodStart' | 'periodEnd', value: string) => {
    setFormData({ [field]: value })
  }

  const isValid = Boolean(formData.placementId) && Boolean(formData.periodStart) && Boolean(formData.periodEnd)

  const handleNext = () => {
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Placement Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Select Placement *</Label>
          <p className="text-sm text-charcoal-500 mb-3">
            Choose an active placement to create a timesheet for
          </p>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search by candidate, job, or account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Placements List */}
          <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
            {isLoadingPlacements ? (
              <div className="p-4 text-center text-charcoal-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                Loading placements...
              </div>
            ) : placements.length === 0 ? (
              <div className="p-4 text-center text-charcoal-500">
                No active placements found
              </div>
            ) : (
              placements.map((placement) => (
                <button
                  key={placement.id}
                  type="button"
                  onClick={() => handlePlacementSelect(placement)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-charcoal-50 transition-colors',
                    selectedPlacement?.id === placement.id && 'bg-hublot-50 border-l-4 border-l-hublot-900'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-charcoal-400" />
                        <span className="font-medium text-charcoal-900">
                          {placement.candidateName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="w-4 h-4 text-charcoal-400" />
                        <span className="text-sm text-charcoal-600">{placement.jobTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4 text-charcoal-400" />
                        <span className="text-sm text-charcoal-600">{placement.accountName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-charcoal-500">
                        Bill: ${placement.billRate}/hr
                      </div>
                      <div className="text-sm text-charcoal-500">
                        Pay: ${placement.payRate}/hr
                      </div>
                      <span className={cn(
                        'inline-block mt-1 px-2 py-0.5 text-xs rounded-full',
                        placement.status === 'active' && 'bg-green-100 text-green-700',
                        placement.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                      )}>
                        {placement.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Period Type Selection */}
        {selectedPlacement && (
          <div>
            <Label className="text-base font-medium">Period Type *</Label>
            <RadioGroup
              onValueChange={(value) => handlePeriodTypeChange(value as PeriodType)}
              value={formData.periodType}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2"
            >
              {PERIOD_TYPES.map((type) => (
                <div key={type.value} className="relative">
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={type.value}
                    className={cn(
                      'flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-all',
                      'hover:border-charcoal-300',
                      'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                    )}
                  >
                    <span className="font-medium">{type.label}</span>
                    <span className="text-xs text-charcoal-500">{type.days} days</span>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Date Range */}
        {selectedPlacement && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="periodStart">Period Start *</Label>
              <Input
                id="periodStart"
                type="date"
                value={formData.periodStart}
                onChange={(e) => handleDateChange('periodStart', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="periodEnd">Period End *</Label>
              <Input
                id="periodEnd"
                type="date"
                value={formData.periodEnd}
                onChange={(e) => handleDateChange('periodEnd', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {/* Selected Summary */}
        {selectedPlacement && formData.periodStart && formData.periodEnd && (
          <div className="p-4 bg-charcoal-50 rounded-lg">
            <h4 className="font-medium text-charcoal-900 mb-2">Selected Period</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-charcoal-500">Candidate:</span>{' '}
                <span className="text-charcoal-900">{formData.candidateName}</span>
              </div>
              <div>
                <span className="text-charcoal-500">Account:</span>{' '}
                <span className="text-charcoal-900">{formData.accountName}</span>
              </div>
              <div>
                <span className="text-charcoal-500">Period:</span>{' '}
                <span className="text-charcoal-900">
                  {format(parseISO(formData.periodStart), 'MMM d, yyyy')} -{' '}
                  {format(parseISO(formData.periodEnd), 'MMM d, yyyy')}
                </span>
              </div>
              <div>
                <span className="text-charcoal-500">Rates:</span>{' '}
                <span className="text-charcoal-900">
                  Bill ${formData.billRate}/hr | Pay ${formData.payRate}/hr
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div />
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleNext} disabled={!isValid}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
