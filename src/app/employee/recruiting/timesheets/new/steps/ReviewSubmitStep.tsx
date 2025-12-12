'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  Loader2,
  Send,
  User,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Receipt,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TimesheetFormData,
  formatHours,
  formatCurrency,
  getDayName,
  getDateDisplay,
  isWeekend,
  EXPENSE_CATEGORIES,
} from '@/stores/timesheet-entry-store'
import { useTimesheetEntryStore } from '@/stores/timesheet-entry-store'
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

export function ReviewSubmitStep({
  formData,
  setFormData,
  onPrev,
  onSubmit,
  isSubmitting,
}: StepProps) {
  const { getTotalHours, getTotalAmounts, getTotalExpenses } = useTimesheetEntryStore()

  const hours = getTotalHours()
  const amounts = getTotalAmounts()
  const expenses = getTotalExpenses()

  const totalBillable = amounts.billable + expenses.billable
  const totalPayable = amounts.payable + expenses.reimbursable

  // Entries with hours
  const entriesWithHours = formData.entries.filter(
    entry =>
      entry.regularHours > 0 ||
      entry.overtimeHours > 0 ||
      entry.doubleTimeHours > 0 ||
      entry.ptoHours > 0 ||
      entry.holidayHours > 0
  )

  // Validation
  const hasHours = hours.total > 0
  const isValid = Boolean(formData.placementId) && Boolean(formData.periodStart) && Boolean(formData.periodEnd)

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="p-4 bg-hublot-50 rounded-lg">
        <h3 className="font-medium text-lg text-charcoal-900 mb-4">Timesheet Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Placement Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-charcoal-400 mt-0.5" />
              <div>
                <div className="text-sm text-charcoal-500">Candidate</div>
                <div className="font-medium text-charcoal-900">{formData.candidateName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-charcoal-400 mt-0.5" />
              <div>
                <div className="text-sm text-charcoal-500">Job Title</div>
                <div className="font-medium text-charcoal-900">{formData.jobTitle}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-charcoal-400 mt-0.5" />
              <div>
                <div className="text-sm text-charcoal-500">Account</div>
                <div className="font-medium text-charcoal-900">{formData.accountName}</div>
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-charcoal-400 mt-0.5" />
              <div>
                <div className="text-sm text-charcoal-500">Period</div>
                <div className="font-medium text-charcoal-900">
                  {format(parseISO(formData.periodStart), 'MMM d, yyyy')} -{' '}
                  {format(parseISO(formData.periodEnd), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-charcoal-400 mt-0.5" />
              <div>
                <div className="text-sm text-charcoal-500">Bill Rate</div>
                <div className="font-medium text-charcoal-900">${formData.billRate}/hr</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-charcoal-400 mt-0.5" />
              <div>
                <div className="text-sm text-charcoal-500">Pay Rate</div>
                <div className="font-medium text-charcoal-900">${formData.payRate}/hr</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hours Summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-charcoal-500" />
          <h4 className="font-medium text-charcoal-900">Hours Summary</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-white border rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-medium text-charcoal-900">
              {formatHours(hours.regular)}
            </div>
            <div className="text-xs text-charcoal-500">Regular</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-charcoal-900">
              {formatHours(hours.overtime)}
            </div>
            <div className="text-xs text-charcoal-500">Overtime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-charcoal-900">
              {formatHours(hours.doubleTime)}
            </div>
            <div className="text-xs text-charcoal-500">Double Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-charcoal-900">
              {formatHours(hours.pto)}
            </div>
            <div className="text-xs text-charcoal-500">PTO</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-medium text-charcoal-900">
              {formatHours(hours.holiday)}
            </div>
            <div className="text-xs text-charcoal-500">Holiday</div>
          </div>
          <div className="text-center border-l-2 border-charcoal-200 pl-4">
            <div className="text-2xl font-bold text-hublot-900">
              {formatHours(hours.total)}
            </div>
            <div className="text-xs text-charcoal-500 font-medium">TOTAL</div>
          </div>
        </div>

        {/* Daily Breakdown (collapsed by default) */}
        {entriesWithHours.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-charcoal-600 hover:text-charcoal-900">
              View daily breakdown ({entriesWithHours.length} days with hours)
            </summary>
            <div className="mt-2 border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-charcoal-50">
                  <tr>
                    <th className="text-left p-2 font-medium">Day</th>
                    <th className="text-center p-2 font-medium">Regular</th>
                    <th className="text-center p-2 font-medium">OT</th>
                    <th className="text-center p-2 font-medium">DT</th>
                    <th className="text-center p-2 font-medium">PTO</th>
                    <th className="text-center p-2 font-medium">Holiday</th>
                    <th className="text-center p-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {entriesWithHours.map((entry) => {
                    const total =
                      entry.regularHours +
                      entry.overtimeHours +
                      entry.doubleTimeHours +
                      entry.ptoHours +
                      entry.holidayHours

                    return (
                      <tr key={entry.workDate} className="border-t">
                        <td className="p-2">
                          <span className={cn(isWeekend(entry.workDate) && 'text-charcoal-500')}>
                            {getDayName(entry.workDate)} - {getDateDisplay(entry.workDate)}
                          </span>
                        </td>
                        <td className="text-center p-2">{entry.regularHours || '-'}</td>
                        <td className="text-center p-2">{entry.overtimeHours || '-'}</td>
                        <td className="text-center p-2">{entry.doubleTimeHours || '-'}</td>
                        <td className="text-center p-2">{entry.ptoHours || '-'}</td>
                        <td className="text-center p-2">{entry.holidayHours || '-'}</td>
                        <td className="text-center p-2 font-medium">{formatHours(total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>

      {/* Expenses Summary */}
      {formData.expenses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="w-5 h-5 text-charcoal-500" />
            <h4 className="font-medium text-charcoal-900">
              Expenses ({formData.expenses.length})
            </h4>
          </div>

          <div className="border rounded-lg divide-y">
            {formData.expenses.map((expense, index) => (
              <div key={index} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-charcoal-900">{expense.description}</div>
                  <div className="text-sm text-charcoal-500">
                    {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label} |{' '}
                    {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(expense.amount)}</div>
                  <div className="text-xs text-charcoal-500">
                    {expense.isBillable && <span className="text-green-600">Billable</span>}
                    {expense.isBillable && expense.isReimbursable && ' | '}
                    {expense.isReimbursable && <span className="text-blue-600">Reimb.</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div>
          <div className="text-sm text-charcoal-600">Hours Billable</div>
          <div className="text-xl font-medium text-charcoal-900">
            {formatCurrency(amounts.billable)}
          </div>
        </div>
        <div>
          <div className="text-sm text-charcoal-600">Expenses Billable</div>
          <div className="text-xl font-medium text-charcoal-900">
            {formatCurrency(expenses.billable)}
          </div>
        </div>
        <div className="border-l-2 border-green-300 pl-4">
          <div className="text-sm text-green-700 font-medium">Total Billable</div>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(totalBillable)}
          </div>
        </div>
        <div className="border-l-2 border-charcoal-300 pl-4">
          <div className="text-sm text-charcoal-600">Total Payable</div>
          <div className="text-xl font-medium text-charcoal-900">
            {formatCurrency(totalPayable)}
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div>
        <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
        <Textarea
          id="internalNotes"
          placeholder="Add any internal notes about this timesheet..."
          value={formData.internalNotes}
          onChange={(e) => setFormData({ internalNotes: e.target.value })}
          className="mt-1 min-h-[80px]"
        />
        <p className="text-xs text-charcoal-500 mt-1">
          These notes are only visible to internal staff
        </p>
      </div>

      {/* Validation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          )}
          <span className={cn(
            'text-sm',
            isValid ? 'text-green-700' : 'text-yellow-700'
          )}>
            {isValid
              ? 'Timesheet is ready to submit'
              : 'Please complete all required fields'}
          </span>
        </div>
        {!hasHours && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-yellow-700">
              No hours entered - this timesheet will be created as a draft
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onPrev} disabled={isSubmitting}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Create Timesheet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
