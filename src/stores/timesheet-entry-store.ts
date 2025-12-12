import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, startOfWeek, endOfWeek, format, parseISO, eachDayOfInterval } from 'date-fns'

// ============================================
// TIMESHEETS-01: Timesheet Entry Store
// Zustand store for timesheet wizard and entry editing
// ============================================

// ============================================
// TYPES
// ============================================

export type PeriodType = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly'

export interface DailyEntry {
  workDate: string
  regularHours: number
  overtimeHours: number
  doubleTimeHours: number
  ptoHours: number
  holidayHours: number
  startTime: string | null
  endTime: string | null
  breakMinutes: number
  projectId: string | null
  taskCode: string | null
  costCenter: string | null
  isBillable: boolean
  description: string | null
}

export interface TimesheetFormData {
  // Context
  placementId: string
  candidateName: string
  jobTitle: string
  accountName: string

  // Period
  periodType: PeriodType
  periodStart: string
  periodEnd: string

  // Rates
  billRate: number
  payRate: number

  // Entries
  entries: DailyEntry[]

  // Expenses
  expenses: ExpenseEntry[]

  // Notes
  internalNotes: string
}

export interface ExpenseEntry {
  id?: string
  expenseDate: string
  category: string
  description: string
  amount: number
  isBillable: boolean
  isReimbursable: boolean
  receiptUrl: string | null
  notes: string | null
}

interface TimesheetEntryStore {
  formData: TimesheetFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null
  isSubmitting: boolean

  // Actions
  setFormData: (data: Partial<TimesheetFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  initializeFromPlacement: (
    placementId: string,
    candidateName: string,
    jobTitle: string,
    accountName: string,
    billRate?: number,
    payRate?: number,
    periodType?: PeriodType
  ) => void
  setPeriod: (periodStart: string, periodEnd: string, periodType: PeriodType) => void
  updateEntry: (workDate: string, entry: Partial<DailyEntry>) => void
  addExpense: (expense: ExpenseEntry) => void
  updateExpense: (index: number, expense: Partial<ExpenseEntry>) => void
  removeExpense: (index: number) => void
  setIsSubmitting: (isSubmitting: boolean) => void

  // Computed
  getTotalHours: () => { regular: number; overtime: number; doubleTime: number; pto: number; holiday: number; total: number }
  getTotalAmounts: () => { billable: number; payable: number }
  getTotalExpenses: () => { billable: number; reimbursable: number; total: number }
}

// ============================================
// DEFAULT VALUES
// ============================================

const getDefaultPeriod = (): { start: string; end: string } => {
  // Default to current week (Monday - Sunday)
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }) // Sunday
  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
  }
}

const createDefaultEntries = (periodStart: string, periodEnd: string): DailyEntry[] => {
  const start = parseISO(periodStart)
  const end = parseISO(periodEnd)
  const days = eachDayOfInterval({ start, end })

  return days.map(day => ({
    workDate: format(day, 'yyyy-MM-dd'),
    regularHours: 0,
    overtimeHours: 0,
    doubleTimeHours: 0,
    ptoHours: 0,
    holidayHours: 0,
    startTime: null,
    endTime: null,
    breakMinutes: 0,
    projectId: null,
    taskCode: null,
    costCenter: null,
    isBillable: true,
    description: null,
  }))
}

const defaultPeriod = getDefaultPeriod()

const defaultFormData: TimesheetFormData = {
  placementId: '',
  candidateName: '',
  jobTitle: '',
  accountName: '',
  periodType: 'weekly',
  periodStart: defaultPeriod.start,
  periodEnd: defaultPeriod.end,
  billRate: 0,
  payRate: 0,
  entries: createDefaultEntries(defaultPeriod.start, defaultPeriod.end),
  expenses: [],
  internalNotes: '',
}

// ============================================
// STORE
// ============================================

export const useTimesheetEntryStore = create<TimesheetEntryStore>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,
      isSubmitting: false,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetForm: () =>
        set({
          formData: {
            ...defaultFormData,
            entries: createDefaultEntries(defaultPeriod.start, defaultPeriod.end),
          },
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
          isSubmitting: false,
        }),

      initializeFromPlacement: (
        placementId,
        candidateName,
        jobTitle,
        accountName,
        billRate,
        payRate,
        periodType = 'weekly'
      ) => {
        const period = getDefaultPeriod()
        set((state) => ({
          formData: {
            ...state.formData,
            placementId,
            candidateName,
            jobTitle,
            accountName,
            billRate: billRate || state.formData.billRate,
            payRate: payRate || state.formData.payRate,
            periodType,
            periodStart: period.start,
            periodEnd: period.end,
            entries: createDefaultEntries(period.start, period.end),
          },
          currentStep: 1,
          isDirty: false,
        }))
      },

      setPeriod: (periodStart, periodEnd, periodType) => {
        const newEntries = createDefaultEntries(periodStart, periodEnd)
        // Preserve any existing entries for matching dates
        const state = get()
        const existingEntriesMap = new Map(
          state.formData.entries.map(e => [e.workDate, e])
        )

        const mergedEntries = newEntries.map(entry => {
          const existing = existingEntriesMap.get(entry.workDate)
          return existing || entry
        })

        set((state) => ({
          formData: {
            ...state.formData,
            periodType,
            periodStart,
            periodEnd,
            entries: mergedEntries,
          },
          isDirty: true,
          lastSaved: new Date(),
        }))
      },

      updateEntry: (workDate, entryUpdate) =>
        set((state) => ({
          formData: {
            ...state.formData,
            entries: state.formData.entries.map((entry) =>
              entry.workDate === workDate
                ? { ...entry, ...entryUpdate }
                : entry
            ),
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      addExpense: (expense) =>
        set((state) => ({
          formData: {
            ...state.formData,
            expenses: [...state.formData.expenses, expense],
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      updateExpense: (index, expenseUpdate) =>
        set((state) => ({
          formData: {
            ...state.formData,
            expenses: state.formData.expenses.map((expense, i) =>
              i === index ? { ...expense, ...expenseUpdate } : expense
            ),
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      removeExpense: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            expenses: state.formData.expenses.filter((_, i) => i !== index),
          },
          isDirty: true,
          lastSaved: new Date(),
        })),

      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      getTotalHours: () => {
        const { entries } = get().formData
        return entries.reduce(
          (acc, entry) => ({
            regular: acc.regular + entry.regularHours,
            overtime: acc.overtime + entry.overtimeHours,
            doubleTime: acc.doubleTime + entry.doubleTimeHours,
            pto: acc.pto + entry.ptoHours,
            holiday: acc.holiday + entry.holidayHours,
            total:
              acc.total +
              entry.regularHours +
              entry.overtimeHours +
              entry.doubleTimeHours +
              entry.ptoHours +
              entry.holidayHours,
          }),
          { regular: 0, overtime: 0, doubleTime: 0, pto: 0, holiday: 0, total: 0 }
        )
      },

      getTotalAmounts: () => {
        const { entries, billRate, payRate } = get().formData
        let billable = 0
        let payable = 0

        entries.forEach((entry) => {
          if (entry.isBillable) {
            // Bill rate: regular + OT*1.5 + DT*2
            billable +=
              entry.regularHours * billRate +
              entry.overtimeHours * billRate * 1.5 +
              entry.doubleTimeHours * billRate * 2
          }
          // Pay rate: regular + OT*1.5 + DT*2
          payable +=
            entry.regularHours * payRate +
            entry.overtimeHours * payRate * 1.5 +
            entry.doubleTimeHours * payRate * 2
        })

        return { billable, payable }
      },

      getTotalExpenses: () => {
        const { expenses } = get().formData
        return expenses.reduce(
          (acc, expense) => ({
            billable: acc.billable + (expense.isBillable ? expense.amount : 0),
            reimbursable: acc.reimbursable + (expense.isReimbursable ? expense.amount : 0),
            total: acc.total + expense.amount,
          }),
          { billable: 0, reimbursable: 0, total: 0 }
        )
      },
    }),
    {
      name: 'timesheet-entry-draft',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        lastSaved: state.lastSaved,
      }),
    }
  )
)

// ============================================
// CONSTANTS
// ============================================

export const PERIOD_TYPES = [
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'bi_weekly', label: 'Bi-Weekly', days: 14 },
  { value: 'semi_monthly', label: 'Semi-Monthly', days: 15 },
  { value: 'monthly', label: 'Monthly', days: 30 },
] as const

export const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'lodging', label: 'Lodging' },
  { value: 'meals', label: 'Meals' },
  { value: 'mileage', label: 'Mileage' },
  { value: 'parking', label: 'Parking' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other' },
] as const

export const WIZARD_STEPS = [
  { number: 1, label: 'Select Period', description: 'Choose the time period for this timesheet' },
  { number: 2, label: 'Enter Hours', description: 'Enter daily hours worked' },
  { number: 3, label: 'Add Expenses', description: 'Add any billable expenses (optional)' },
  { number: 4, label: 'Review & Submit', description: 'Review and submit for approval' },
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatHours(hours: number): string {
  return hours.toFixed(1)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getDayName(dateString: string): string {
  return format(parseISO(dateString), 'EEE')
}

export function getDateDisplay(dateString: string): string {
  return format(parseISO(dateString), 'MMM d')
}

export function isWeekend(dateString: string): boolean {
  const date = parseISO(dateString)
  const day = date.getDay()
  return day === 0 || day === 6
}

export function calculatePeriodDates(
  periodType: PeriodType,
  referenceDate: Date = new Date()
): { start: string; end: string } {
  switch (periodType) {
    case 'weekly': {
      const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
      const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
      }
    }
    case 'bi_weekly': {
      const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
      const end = addDays(start, 13) // 14 days total
      return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
      }
    }
    case 'semi_monthly': {
      const day = referenceDate.getDate()
      const year = referenceDate.getFullYear()
      const month = referenceDate.getMonth()
      if (day <= 15) {
        return {
          start: format(new Date(year, month, 1), 'yyyy-MM-dd'),
          end: format(new Date(year, month, 15), 'yyyy-MM-dd'),
        }
      } else {
        const lastDay = new Date(year, month + 1, 0).getDate()
        return {
          start: format(new Date(year, month, 16), 'yyyy-MM-dd'),
          end: format(new Date(year, month, lastDay), 'yyyy-MM-dd'),
        }
      }
    }
    case 'monthly': {
      const year = referenceDate.getFullYear()
      const month = referenceDate.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()
      return {
        start: format(new Date(year, month, 1), 'yyyy-MM-dd'),
        end: format(new Date(year, month, lastDay), 'yyyy-MM-dd'),
      }
    }
    default:
      return getDefaultPeriod()
  }
}
