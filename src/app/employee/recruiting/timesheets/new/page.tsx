'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTimesheetEntryStore, WIZARD_STEPS } from '@/stores/timesheet-entry-store'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, Receipt, CheckCircle, X } from 'lucide-react'
import {
  StepIndicator,
  SelectPeriodStep,
  EnterHoursStep,
  AddExpensesStep,
  ReviewSubmitStep,
} from './steps'

const STEPS = [
  { id: 1, title: 'Select Period', icon: Calendar },
  { id: 2, title: 'Enter Hours', icon: Clock },
  { id: 3, title: 'Add Expenses', icon: Receipt },
  { id: 4, title: 'Review & Submit', icon: CheckCircle },
]

const STEP_COMPONENTS = [
  SelectPeriodStep,
  EnterHoursStep,
  AddExpensesStep,
  ReviewSubmitStep,
]

function TimesheetWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStep = parseInt(searchParams.get('step') || '1')

  const {
    formData,
    setFormData,
    setCurrentStep,
    resetForm,
    lastSaved,
    isDirty,
    setIsSubmitting,
    getTotalHours,
    getTotalAmounts,
    getTotalExpenses,
  } = useTimesheetEntryStore()

  // Sync URL step with store
  useEffect(() => {
    setCurrentStep(currentStep)
  }, [currentStep, setCurrentStep])

  const navigateToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', step.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const createTimesheet = trpc.timesheets.create.useMutation({
    onSuccess: (data) => {
      toast.success('Timesheet created successfully!')
      resetForm()
      router.push(`/employee/recruiting/timesheets/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create timesheet')
      setIsSubmitting(false)
    },
  })

  const handleSubmit = () => {
    setIsSubmitting(true)

    const hours = getTotalHours()
    const amounts = getTotalAmounts()
    const expenseTotals = getTotalExpenses()

    // Build entries array for submission
    const entries = formData.entries
      .filter(entry =>
        entry.regularHours > 0 ||
        entry.overtimeHours > 0 ||
        entry.doubleTimeHours > 0 ||
        entry.ptoHours > 0 ||
        entry.holidayHours > 0
      )
      .map(entry => ({
        workDate: entry.workDate,
        regularHours: entry.regularHours,
        overtimeHours: entry.overtimeHours,
        doubleTimeHours: entry.doubleTimeHours,
        ptoHours: entry.ptoHours,
        holidayHours: entry.holidayHours,
        startTime: entry.startTime || undefined,
        endTime: entry.endTime || undefined,
        breakMinutes: entry.breakMinutes || undefined,
        projectId: entry.projectId || undefined,
        taskCode: entry.taskCode || undefined,
        costCenter: entry.costCenter || undefined,
        isBillable: entry.isBillable,
        description: entry.description || undefined,
      }))

    // Build expenses array for submission
    type ExpenseCategory = 'travel' | 'lodging' | 'meals' | 'mileage' | 'parking' | 'equipment' | 'supplies' | 'communication' | 'other'
    const expenses = formData.expenses.map(expense => ({
      expenseDate: expense.expenseDate,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      amount: expense.amount,
      isBillable: expense.isBillable,
      isReimbursable: expense.isReimbursable,
      receiptUrl: expense.receiptUrl || undefined,
      notes: expense.notes || undefined,
    }))

    createTimesheet.mutate({
      placementId: formData.placementId,
      periodType: formData.periodType,
      periodStart: formData.periodStart,
      periodEnd: formData.periodEnd,
      totalRegularHours: hours.regular,
      totalOvertimeHours: hours.overtime,
      totalDoubleTimeHours: hours.doubleTime,
      totalPtoHours: hours.pto,
      totalHolidayHours: hours.holiday,
      totalHours: hours.total,
      billRate: formData.billRate,
      payRate: formData.payRate,
      totalBillable: amounts.billable + expenseTotals.billable,
      totalPayable: amounts.payable,
      totalExpenses: expenseTotals.total,
      internalNotes: formData.internalNotes || undefined,
      entries,
      expenses,
    })
  }

  const handleCancel = () => {
    if (isDirty) {
      toast.info('Draft saved. You can continue later.')
    }
    router.push('/employee/recruiting/timesheets')
  }

  const handleDiscardDraft = () => {
    resetForm()
    toast.success('Draft discarded')
  }

  const StepComponent = STEP_COMPONENTS[currentStep - 1]

  // Check if placement is selected
  const hasPlacement = Boolean(formData.placementId)

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
          <Link href="/employee/workspace/dashboard" className="hover:text-hublot-700 transition-colors">
            My Work
          </Link>
          <span>/</span>
          <Link href="/employee/recruiting/timesheets" className="hover:text-hublot-700 transition-colors">
            Timesheets
          </Link>
          <span>/</span>
          <span className="text-charcoal-900 font-medium">New Timesheet</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/employee/recruiting/timesheets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-heading font-semibold text-charcoal-900">Create New Timesheet</h1>
            <p className="text-charcoal-500">
              {hasPlacement
                ? `${formData.candidateName} - ${formData.jobTitle} @ ${formData.accountName}`
                : 'Select a placement to create a timesheet'}
            </p>
          </div>
        </div>

        {/* Draft Recovery Banner */}
        {lastSaved && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Draft saved {new Date(lastSaved).toLocaleString()}
            </span>
            <button
              onClick={handleDiscardDraft}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Discard draft
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {StepComponent && (
            <StepComponent
              formData={formData}
              setFormData={setFormData}
              onNext={() => navigateToStep(currentStep + 1)}
              onPrev={() => navigateToStep(currentStep - 1)}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isFirst={currentStep === 1}
              isLast={currentStep === STEPS.length}
              isSubmitting={createTimesheet.isPending}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewTimesheetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center">Loading...</div>}>
      <TimesheetWizardContent />
    </Suspense>
  )
}
