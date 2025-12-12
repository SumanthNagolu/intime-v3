'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, Calculator, Play, DollarSign, Calendar, Users, FileText, Check } from 'lucide-react'
import { usePayRunProcessStore, PAY_RUN_TYPES, PAY_RUN_WIZARD_STEPS, formatCurrency, formatPeriod, calculateSelectedTotals } from '@/stores/pay-run-process-store'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export default function NewPayRunPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = parseInt(searchParams.get('step') || '1')

  const {
    formData,
    setFormData,
    setCurrentStep,
    resetForm,
    setTimesheetSelections,
    toggleTimesheetSelection,
    toggleSelectAll,
    getSelectedTimesheetIds,
    setCalculatedTotals,
    setCalculationState,
  } = usePayRunProcessStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch pay periods
  const { data: payPeriods } = trpc.payroll.payPeriods.list.useQuery({
    limit: 20,
  })

  // Create pay run mutation
  const createMutation = trpc.payroll.create.useMutation({
    onSuccess: (data) => {
      // Calculate the pay run
      calculateMutation.mutate({ id: data.id, timesheetIds: getSelectedTimesheetIds() })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create pay run')
      setIsSubmitting(false)
    },
  })

  // Calculate mutation
  const calculateMutation = trpc.payroll.calculate.useMutation({
    onSuccess: (data) => {
      toast.success('Pay run created and calculated successfully')
      resetForm()
      router.push(`/employee/finance/payroll/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to calculate pay run')
      setIsSubmitting(false)
    },
  })

  const navigateToStep = (newStep: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', newStep.toString())
    router.push(`?${params.toString()}`, { scroll: false })
    setCurrentStep(newStep)
  }

  const handlePeriodSelect = (periodId: string) => {
    const period = payPeriods?.items.find((p) => p.id === periodId)
    if (period) {
      setFormData({
        payPeriodId: period.id,
        payPeriodLabel: `Period ${period.periodNumber} - ${period.year}`,
        periodStart: period.periodStart,
        periodEnd: period.periodEnd,
        checkDate: period.payDate,
        directDepositDate: period.payDate,
      })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    if (!formData.payPeriodId) {
      toast.error('Please select a pay period')
      setIsSubmitting(false)
      return
    }

    createMutation.mutate({
      payPeriodId: formData.payPeriodId,
      runType: formData.runType,
      checkDate: formData.checkDate,
      directDepositDate: formData.directDepositDate || undefined,
      notes: formData.notes || undefined,
    })
  }

  const selectedTotals = calculateSelectedTotals(formData.timesheetSelections)

  return (
    <SidebarLayout sectionId="payroll">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal-900">New Pay Run</h1>
            <p className="text-charcoal-500 mt-1">Create and process a new payroll run</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/employee/finance/payroll')}>
            Cancel
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4">
          {PAY_RUN_WIZARD_STEPS.map((wizardStep, index) => (
            <div key={wizardStep.id} className="flex items-center">
              <button
                onClick={() => navigateToStep(wizardStep.number)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                  step === wizardStep.number
                    ? 'bg-gold-50 text-gold-700'
                    : step > wizardStep.number
                    ? 'text-success-600'
                    : 'text-charcoal-400'
                )}
              >
                <span className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === wizardStep.number
                    ? 'bg-gold-500 text-white'
                    : step > wizardStep.number
                    ? 'bg-success-500 text-white'
                    : 'bg-charcoal-200 text-charcoal-500'
                )}>
                  {step > wizardStep.number ? <Check className="h-4 w-4" /> : wizardStep.number}
                </span>
                <span className="hidden sm:block font-medium">{wizardStep.label}</span>
              </button>
              {index < PAY_RUN_WIZARD_STEPS.length - 1 && (
                <div className={cn(
                  'w-12 h-0.5 mx-2',
                  step > wizardStep.number ? 'bg-success-500' : 'bg-charcoal-200'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-charcoal-500" />
                <h2 className="text-lg font-semibold">Select Pay Period</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pay Period</Label>
                  <Select
                    value={formData.payPeriodId}
                    onValueChange={handlePeriodSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pay period" />
                    </SelectTrigger>
                    <SelectContent>
                      {payPeriods?.items.map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          Period {period.periodNumber} ({formatPeriod(period.periodStart, period.periodEnd)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.payPeriodId && (
                  <Card className="p-4 bg-charcoal-50">
                    <h4 className="font-medium mb-2">Selected Period</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-charcoal-500">Period: </span>
                        <span>{formData.payPeriodLabel}</span>
                      </div>
                      <div>
                        <span className="text-charcoal-500">Dates: </span>
                        <span>{formatPeriod(formData.periodStart, formData.periodEnd)}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-charcoal-500" />
                <h2 className="text-lg font-semibold">Pay Run Configuration</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Run Type</Label>
                  <Select
                    value={formData.runType}
                    onValueChange={(value) => setFormData({ runType: value as typeof formData.runType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAY_RUN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-charcoal-500">
                    {PAY_RUN_TYPES.find((t) => t.value === formData.runType)?.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check Date</Label>
                  <Input
                    type="date"
                    value={formData.checkDate}
                    onChange={(e) => setFormData({ checkDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Direct Deposit Date</Label>
                  <Input
                    type="date"
                    value={formData.directDepositDate}
                    onChange={(e) => setFormData({ directDepositDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ notes: e.target.value })}
                  placeholder="Any notes for this pay run..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-charcoal-500" />
                  <h2 className="text-lg font-semibold">Select Timesheets</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="selectAll"
                    checked={formData.selectAll}
                    onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                  />
                  <Label htmlFor="selectAll" className="text-sm">Select All</Label>
                </div>
              </div>

              {formData.timesheetSelections.length === 0 ? (
                <div className="text-center py-8 text-charcoal-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
                  <p>No approved timesheets found for this period</p>
                  <p className="text-sm mt-1">Make sure timesheets are approved before creating a pay run</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.timesheetSelections.map((ts) => (
                    <Card
                      key={ts.id}
                      className={cn(
                        'p-4 cursor-pointer transition-colors',
                        ts.isSelected ? 'bg-gold-50 border-gold-200' : 'hover:bg-charcoal-50'
                      )}
                      onClick={() => toggleTimesheetSelection(ts.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={ts.isSelected}
                            onCheckedChange={() => toggleTimesheetSelection(ts.id)}
                          />
                          <div>
                            <p className="font-medium">{ts.consultantName}</p>
                            <p className="text-sm text-charcoal-500">
                              {formatPeriod(ts.periodStart, ts.periodEnd)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{ts.totalHours.toFixed(1)} hrs</p>
                          <p className="text-sm text-charcoal-500">{formatCurrency(ts.totalPayableAmount)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {formData.timesheetSelections.length > 0 && (
                <Card className="p-4 bg-charcoal-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Selected: {selectedTotals.count} timesheets</span>
                    <div className="text-right">
                      <p className="font-medium">{selectedTotals.totalHours.toFixed(1)} total hours</p>
                      <p className="text-sm text-charcoal-500">{formatCurrency(selectedTotals.totalPayable)} estimated</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-charcoal-500" />
                <h2 className="text-lg font-semibold">Review & Process</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Pay Run Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Pay Period</span>
                        <span>{formData.payPeriodLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Period Dates</span>
                        <span>{formatPeriod(formData.periodStart, formData.periodEnd)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Run Type</span>
                        <span className="capitalize">{formData.runType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Check Date</span>
                        <span>{formData.checkDate}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Selected Timesheets</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Total Timesheets</span>
                        <span>{selectedTotals.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Total Hours</span>
                        <span>{selectedTotals.totalHours.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Estimated Payable</span>
                        <span>{formatCurrency(selectedTotals.totalPayable)}</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="p-4 bg-gold-50 border-gold-200">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gold-600" />
                      Estimated Totals
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-charcoal-600">Gross Pay</span>
                        <span className="font-medium">{formatCurrency(formData.calculatedTotals.totalGross || selectedTotals.totalPayable)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-500">Employee Taxes (est.)</span>
                        <span>-{formatCurrency(selectedTotals.totalPayable * 0.25)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-charcoal-500">Employer Taxes (est.)</span>
                        <span>{formatCurrency(selectedTotals.totalPayable * 0.08)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-semibold">Net Pay (est.)</span>
                        <span className="font-semibold text-lg text-success-600">
                          {formatCurrency(selectedTotals.totalPayable * 0.75)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-charcoal-500 mt-3">
                      * Actual amounts will be calculated based on worker tax setup
                    </p>
                  </Card>

                  {formData.notes && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-charcoal-600">{formData.notes}</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigateToStep(step - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            {step < 4 ? (
              <Button
                onClick={() => navigateToStep(step + 1)}
                disabled={step === 1 && !formData.payPeriodId}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.payPeriodId}
              >
                {isSubmitting ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Create & Calculate Pay Run
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
