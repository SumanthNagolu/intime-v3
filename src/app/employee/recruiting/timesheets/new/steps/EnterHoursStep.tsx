'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight, ChevronLeft, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TimesheetFormData,
  DailyEntry,
  formatHours,
  getDayName,
  getDateDisplay,
  isWeekend,
} from '@/stores/timesheet-entry-store'
import { useTimesheetEntryStore } from '@/stores/timesheet-entry-store'

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

export function EnterHoursStep({
  formData,
  onNext,
  onPrev,
}: StepProps) {
  const { updateEntry, getTotalHours, getTotalAmounts } = useTimesheetEntryStore()

  const totals = getTotalHours()
  const amounts = getTotalAmounts()

  const handleHoursChange = (
    workDate: string,
    field: keyof Pick<DailyEntry, 'regularHours' | 'overtimeHours' | 'doubleTimeHours' | 'ptoHours' | 'holidayHours'>,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0
    updateEntry(workDate, { [field]: Math.max(0, numValue) })
  }

  const handleTimeChange = (
    workDate: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    updateEntry(workDate, { [field]: value || null })
  }

  const handleBreakChange = (workDate: string, value: string) => {
    const numValue = parseInt(value) || 0
    updateEntry(workDate, { breakMinutes: Math.max(0, numValue) })
  }

  const handleBillableChange = (workDate: string, checked: boolean) => {
    updateEntry(workDate, { isBillable: checked })
  }

  const handleDescriptionChange = (workDate: string, value: string) => {
    updateEntry(workDate, { description: value || null })
  }

  // Calculate daily total
  const getDailyTotal = (entry: DailyEntry): number => {
    return (
      entry.regularHours +
      entry.overtimeHours +
      entry.doubleTimeHours +
      entry.ptoHours +
      entry.holidayHours
    )
  }

  // Validate - at least some hours entered
  const hasAnyHours = totals.total > 0

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
        <div>
          <h3 className="font-medium text-charcoal-900">{formData.candidateName}</h3>
          <p className="text-sm text-charcoal-500">
            {formData.jobTitle} @ {formData.accountName}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-charcoal-500">
            Bill Rate: ${formData.billRate}/hr
          </div>
          <div className="text-sm text-charcoal-500">
            Pay Rate: ${formData.payRate}/hr
          </div>
        </div>
      </div>

      {/* Time Entry Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-charcoal-500" />
          <Label className="text-base font-medium">Daily Time Entries</Label>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-charcoal-50">
                <th className="text-left p-3 font-medium text-charcoal-700 w-24">Day</th>
                <th className="text-left p-3 font-medium text-charcoal-700 w-28">Date</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-20">Regular</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-20">OT</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-20">Double</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-20">PTO</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-20">Holiday</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-20">Total</th>
                <th className="text-center p-3 font-medium text-charcoal-700 w-16">Bill</th>
              </tr>
            </thead>
            <tbody>
              {formData.entries.map((entry) => {
                const weekend = isWeekend(entry.workDate)
                const dailyTotal = getDailyTotal(entry)

                return (
                  <tr
                    key={entry.workDate}
                    className={cn(
                      'border-b hover:bg-charcoal-25 transition-colors',
                      weekend && 'bg-charcoal-50/50'
                    )}
                  >
                    <td className="p-3">
                      <span className={cn('font-medium', weekend && 'text-charcoal-500')}>
                        {getDayName(entry.workDate)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-charcoal-600">
                      {getDateDisplay(entry.workDate)}
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.regularHours || ''}
                        onChange={(e) => handleHoursChange(entry.workDate, 'regularHours', e.target.value)}
                        className="w-16 text-center h-8 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.overtimeHours || ''}
                        onChange={(e) => handleHoursChange(entry.workDate, 'overtimeHours', e.target.value)}
                        className="w-16 text-center h-8 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.doubleTimeHours || ''}
                        onChange={(e) => handleHoursChange(entry.workDate, 'doubleTimeHours', e.target.value)}
                        className="w-16 text-center h-8 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.ptoHours || ''}
                        onChange={(e) => handleHoursChange(entry.workDate, 'ptoHours', e.target.value)}
                        className="w-16 text-center h-8 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.holidayHours || ''}
                        onChange={(e) => handleHoursChange(entry.workDate, 'holidayHours', e.target.value)}
                        className="w-16 text-center h-8 text-sm"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-3 text-center font-medium">
                      {dailyTotal > 0 ? formatHours(dailyTotal) : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={entry.isBillable}
                        onCheckedChange={(checked) => handleBillableChange(entry.workDate, checked as boolean)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-charcoal-100 font-medium">
                <td colSpan={2} className="p-3 text-right">Totals:</td>
                <td className="p-3 text-center">{formatHours(totals.regular)}</td>
                <td className="p-3 text-center">{formatHours(totals.overtime)}</td>
                <td className="p-3 text-center">{formatHours(totals.doubleTime)}</td>
                <td className="p-3 text-center">{formatHours(totals.pto)}</td>
                <td className="p-3 text-center">{formatHours(totals.holiday)}</td>
                <td className="p-3 text-center">{formatHours(totals.total)}</td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {formData.entries.map((entry) => {
            const weekend = isWeekend(entry.workDate)
            const dailyTotal = getDailyTotal(entry)

            return (
              <div
                key={entry.workDate}
                className={cn(
                  'p-4 border rounded-lg',
                  weekend && 'bg-charcoal-50/50'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className={cn('font-medium', weekend && 'text-charcoal-500')}>
                      {getDayName(entry.workDate)}
                    </span>
                    <span className="text-sm text-charcoal-500 ml-2">
                      {getDateDisplay(entry.workDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-charcoal-500">Billable:</span>
                    <Checkbox
                      checked={entry.isBillable}
                      onCheckedChange={(checked) => handleBillableChange(entry.workDate, checked as boolean)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-charcoal-500">Regular</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={entry.regularHours || ''}
                      onChange={(e) => handleHoursChange(entry.workDate, 'regularHours', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-charcoal-500">OT</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={entry.overtimeHours || ''}
                      onChange={(e) => handleHoursChange(entry.workDate, 'overtimeHours', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-charcoal-500">Double</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={entry.doubleTimeHours || ''}
                      onChange={(e) => handleHoursChange(entry.workDate, 'doubleTimeHours', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-charcoal-500">PTO</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={entry.ptoHours || ''}
                      onChange={(e) => handleHoursChange(entry.workDate, 'ptoHours', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-charcoal-500">Holiday</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={entry.holidayHours || ''}
                      onChange={(e) => handleHoursChange(entry.workDate, 'holidayHours', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end justify-center pb-1">
                    <span className="text-sm font-medium">
                      Total: {dailyTotal > 0 ? formatHours(dailyTotal) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Mobile Totals */}
          <div className="p-4 bg-charcoal-100 rounded-lg">
            <h4 className="font-medium mb-2">Period Totals</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>Regular: {formatHours(totals.regular)}</div>
              <div>OT: {formatHours(totals.overtime)}</div>
              <div>Double: {formatHours(totals.doubleTime)}</div>
              <div>PTO: {formatHours(totals.pto)}</div>
              <div>Holiday: {formatHours(totals.holiday)}</div>
              <div className="font-medium">Total: {formatHours(totals.total)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-hublot-50 rounded-lg">
        <div>
          <div className="text-sm text-charcoal-500">Total Hours</div>
          <div className="text-xl font-medium text-charcoal-900">{formatHours(totals.total)}</div>
        </div>
        <div>
          <div className="text-sm text-charcoal-500">Regular Hours</div>
          <div className="text-xl font-medium text-charcoal-900">{formatHours(totals.regular)}</div>
        </div>
        <div>
          <div className="text-sm text-charcoal-500">Billable Amount</div>
          <div className="text-xl font-medium text-green-600">
            ${amounts.billable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-sm text-charcoal-500">Payable Amount</div>
          <div className="text-xl font-medium text-charcoal-900">
            ${amounts.payable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Warning if no hours */}
      {!hasAnyHours && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">No hours entered yet. You can proceed and add hours later if needed.</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
