import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// PAYROLL-01: Pay Run Process Store
// Multi-step pay run creation and processing wizard
// ============================================

// Types
export interface TimesheetSelection {
  id: string
  placementId: string
  consultantName: string
  periodStart: string
  periodEnd: string
  totalHours: number
  totalBillableAmount: number
  totalPayableAmount: number
  status: string
  isSelected: boolean
}

export interface PayRunCreateFormData {
  // Step 1: Period Selection
  payPeriodId: string
  payPeriodLabel: string
  periodStart: string
  periodEnd: string

  // Step 2: Run Configuration
  runType: 'regular' | 'off_cycle' | 'bonus' | 'final' | 'correction'
  checkDate: string
  directDepositDate: string
  notes: string

  // Step 3: Timesheet Selection
  timesheetSelections: TimesheetSelection[]
  selectAll: boolean

  // Step 4: Review
  calculatedTotals: {
    totalGross: number
    totalEmployerTaxes: number
    totalEmployeeTaxes: number
    totalDeductions: number
    totalNet: number
    totalEmployerCost: number
    employeeCount: number
    consultantCount: number
    contractorCount: number
  }

  // Processing state
  isCalculating: boolean
  calculationError: string | null
}

interface PayRunProcessStore {
  formData: PayRunCreateFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<PayRunCreateFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void

  // Timesheet selection actions
  setTimesheetSelections: (timesheets: TimesheetSelection[]) => void
  toggleTimesheetSelection: (timesheetId: string) => void
  toggleSelectAll: (selected: boolean) => void
  getSelectedTimesheetIds: () => string[]

  // Calculation actions
  setCalculatedTotals: (totals: PayRunCreateFormData['calculatedTotals']) => void
  setCalculationState: (isCalculating: boolean, error?: string | null) => void

  // Initialization
  initializeFromPayPeriod: (payPeriod: {
    id: string
    label: string
    periodStart: string
    periodEnd: string
    payDate: string
  }) => void
}

const defaultFormData: PayRunCreateFormData = {
  // Step 1
  payPeriodId: '',
  payPeriodLabel: '',
  periodStart: '',
  periodEnd: '',

  // Step 2
  runType: 'regular',
  checkDate: '',
  directDepositDate: '',
  notes: '',

  // Step 3
  timesheetSelections: [],
  selectAll: true,

  // Step 4
  calculatedTotals: {
    totalGross: 0,
    totalEmployerTaxes: 0,
    totalEmployeeTaxes: 0,
    totalDeductions: 0,
    totalNet: 0,
    totalEmployerCost: 0,
    employeeCount: 0,
    consultantCount: 0,
    contractorCount: 0,
  },

  // Processing state
  isCalculating: false,
  calculationError: null,
}

export const usePayRunProcessStore = create<PayRunProcessStore>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetForm: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      setTimesheetSelections: (timesheets) =>
        set((state) => ({
          formData: {
            ...state.formData,
            timesheetSelections: timesheets.map((ts) => ({
              ...ts,
              isSelected: state.formData.selectAll,
            })),
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      toggleTimesheetSelection: (timesheetId) =>
        set((state) => {
          const selections = state.formData.timesheetSelections.map((ts) =>
            ts.id === timesheetId ? { ...ts, isSelected: !ts.isSelected } : ts
          )
          const allSelected = selections.every((ts) => ts.isSelected)
          return {
            formData: {
              ...state.formData,
              timesheetSelections: selections,
              selectAll: allSelected,
            },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),

      toggleSelectAll: (selected) =>
        set((state) => ({
          formData: {
            ...state.formData,
            selectAll: selected,
            timesheetSelections: state.formData.timesheetSelections.map((ts) => ({
              ...ts,
              isSelected: selected,
            })),
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      getSelectedTimesheetIds: () => {
        const state = get()
        return state.formData.timesheetSelections
          .filter((ts) => ts.isSelected)
          .map((ts) => ts.id)
      },

      setCalculatedTotals: (totals) =>
        set((state) => ({
          formData: {
            ...state.formData,
            calculatedTotals: totals,
            isCalculating: false,
            calculationError: null,
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setCalculationState: (isCalculating, error = null) =>
        set((state) => ({
          formData: {
            ...state.formData,
            isCalculating,
            calculationError: error,
          },
        })),

      initializeFromPayPeriod: (payPeriod) =>
        set((state) => ({
          formData: {
            ...state.formData,
            payPeriodId: payPeriod.id,
            payPeriodLabel: payPeriod.label,
            periodStart: payPeriod.periodStart,
            periodEnd: payPeriod.periodEnd,
            checkDate: payPeriod.payDate,
            directDepositDate: payPeriod.payDate,
          },
          isDirty: true,
          lastSaved: new Date(),
        })),
    }),
    {
      name: 'pay-run-process-form',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// ============================================
// CONSTANTS FOR FORM OPTIONS
// ============================================

export const PAY_RUN_TYPES = [
  { value: 'regular', label: 'Regular', description: 'Standard scheduled payroll run' },
  { value: 'off_cycle', label: 'Off-Cycle', description: 'Additional run outside normal schedule' },
  { value: 'bonus', label: 'Bonus', description: 'Bonus payment run' },
  { value: 'final', label: 'Final', description: 'Final pay for terminated workers' },
  { value: 'correction', label: 'Correction', description: 'Correction to previous run' },
] as const

export const PAYMENT_METHODS = [
  { value: 'direct_deposit', label: 'Direct Deposit' },
  { value: 'check', label: 'Check' },
  { value: 'wire', label: 'Wire Transfer' },
] as const

// ============================================
// WIZARD STEP CONFIGURATION
// ============================================

export const PAY_RUN_WIZARD_STEPS = [
  {
    number: 1,
    id: 'period',
    label: 'Pay Period',
    description: 'Select the pay period for this run',
  },
  {
    number: 2,
    id: 'configuration',
    label: 'Configuration',
    description: 'Set run type and payment dates',
  },
  {
    number: 3,
    id: 'timesheets',
    label: 'Timesheets',
    description: 'Select timesheets to include',
  },
  {
    number: 4,
    id: 'review',
    label: 'Review & Process',
    description: 'Review calculations and process',
  },
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startStr} - ${endStr}`
}

export function calculateSelectedTotals(selections: TimesheetSelection[]): {
  totalHours: number
  totalPayable: number
  count: number
} {
  const selected = selections.filter((ts) => ts.isSelected)
  return {
    totalHours: selected.reduce((sum, ts) => sum + ts.totalHours, 0),
    totalPayable: selected.reduce((sum, ts) => sum + ts.totalPayableAmount, 0),
    count: selected.length,
  }
}
