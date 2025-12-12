import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// INVOICES-01: Invoice Creation Store
// Multi-step invoice creation wizard with draft persistence
// ============================================

// Types
export interface InvoiceLineItemDraft {
  id: string // temp ID for tracking in UI
  description: string
  serviceStartDate: string
  serviceEndDate: string
  quantity: number
  unitType: 'hours' | 'days' | 'units' | 'fixed'
  unitRate: number
  discountAmount: number
  taxRate: number
  // Source tracking
  timesheetId: string | null
  timesheetEntryId: string | null
  placementId: string | null
  glCode: string | null
  costCenter: string | null
  projectCode: string | null
}

export interface InvoiceCreateFormData {
  // Step 1: Client Selection
  accountId: string
  accountName: string
  companyId: string
  companyName: string
  billingContactId: string
  billingContactName: string
  billingContactEmail: string

  // Step 2: Invoice Details
  invoiceType: 'standard' | 'fixed_fee' | 'retainer' | 'milestone' | 'credit_note' | 'final'
  referenceNumber: string
  invoiceDate: string
  dueDate: string
  paymentTermsId: string
  paymentTermsName: string
  currency: string

  // Step 3: Line Items
  lineItems: InvoiceLineItemDraft[]

  // Discounts & Tax
  discountType: 'none' | 'percentage' | 'fixed'
  discountPercentage: number
  discountAmount: number
  taxRate: number

  // Step 4: Additional Details
  paymentInstructions: string
  clientNotes: string
  internalNotes: string
  termsAndConditions: string
  templateId: string

  // Calculated totals (for display)
  subtotal: number
  totalDiscount: number
  totalTax: number
  totalAmount: number

  // Source timesheets (for generation from timesheets)
  sourceTimesheetIds: string[]
}

interface InvoiceCreateStore {
  formData: InvoiceCreateFormData
  currentStep: number
  isDirty: boolean
  lastSaved: Date | null

  // Actions
  setFormData: (data: Partial<InvoiceCreateFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void

  // Line item actions
  addLineItem: (item: InvoiceLineItemDraft) => void
  updateLineItem: (id: string, data: Partial<InvoiceLineItemDraft>) => void
  removeLineItem: (id: string) => void

  // Calculation actions
  recalculateTotals: () => void

  // Initialization
  initializeFromAccount: (accountId: string, accountName: string) => void
  initializeFromTimesheets: (timesheetIds: string[], timesheetData: {
    lineItems: InvoiceLineItemDraft[]
    accountId: string
    accountName: string
    companyId: string
    companyName: string
  }) => void
}

const defaultFormData: InvoiceCreateFormData = {
  // Step 1
  accountId: '',
  accountName: '',
  companyId: '',
  companyName: '',
  billingContactId: '',
  billingContactName: '',
  billingContactEmail: '',

  // Step 2
  invoiceType: 'standard',
  referenceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  paymentTermsId: '',
  paymentTermsName: '',
  currency: 'USD',

  // Step 3
  lineItems: [],

  // Discounts & Tax
  discountType: 'none',
  discountPercentage: 0,
  discountAmount: 0,
  taxRate: 0,

  // Step 4
  paymentInstructions: '',
  clientNotes: '',
  internalNotes: '',
  termsAndConditions: '',
  templateId: '',

  // Calculated totals
  subtotal: 0,
  totalDiscount: 0,
  totalTax: 0,
  totalAmount: 0,

  // Source
  sourceTimesheetIds: [],
}

function calculateLineItemTotal(item: InvoiceLineItemDraft): number {
  const subtotal = item.quantity * item.unitRate
  const afterDiscount = subtotal - item.discountAmount
  const tax = afterDiscount * (item.taxRate / 100)
  return afterDiscount + tax
}

function calculateTotals(formData: InvoiceCreateFormData): {
  subtotal: number
  totalDiscount: number
  totalTax: number
  totalAmount: number
} {
  // Calculate line items subtotal
  const lineItemsSubtotal = formData.lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitRate)
  }, 0)

  // Calculate line items discount
  const lineItemsDiscount = formData.lineItems.reduce((sum, item) => {
    return sum + item.discountAmount
  }, 0)

  // Calculate invoice-level discount
  let invoiceDiscount = 0
  if (formData.discountType === 'percentage') {
    invoiceDiscount = (lineItemsSubtotal - lineItemsDiscount) * (formData.discountPercentage / 100)
  } else if (formData.discountType === 'fixed') {
    invoiceDiscount = formData.discountAmount
  }

  const totalDiscount = lineItemsDiscount + invoiceDiscount
  const afterDiscount = lineItemsSubtotal - totalDiscount

  // Calculate line items tax
  const lineItemsTax = formData.lineItems.reduce((sum, item) => {
    const itemAfterDiscount = (item.quantity * item.unitRate) - item.discountAmount
    return sum + (itemAfterDiscount * (item.taxRate / 100))
  }, 0)

  // Calculate invoice-level tax
  const invoiceTax = afterDiscount * (formData.taxRate / 100)
  const totalTax = lineItemsTax + invoiceTax

  const totalAmount = afterDiscount + totalTax

  return {
    subtotal: lineItemsSubtotal,
    totalDiscount,
    totalTax,
    totalAmount,
  }
}

export const useInvoiceCreateStore = create<InvoiceCreateStore>()(
  persist(
    (set, get) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) =>
        set((state) => {
          const newFormData = { ...state.formData, ...data }
          const totals = calculateTotals(newFormData)
          return {
            formData: { ...newFormData, ...totals },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetForm: () =>
        set({
          formData: defaultFormData,
          currentStep: 1,
          isDirty: false,
          lastSaved: null,
        }),

      addLineItem: (item) =>
        set((state) => {
          const lineItems = [...state.formData.lineItems, item]
          const newFormData = { ...state.formData, lineItems }
          const totals = calculateTotals(newFormData)
          return {
            formData: { ...newFormData, ...totals },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),

      updateLineItem: (id, data) =>
        set((state) => {
          const lineItems = state.formData.lineItems.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
          const newFormData = { ...state.formData, lineItems }
          const totals = calculateTotals(newFormData)
          return {
            formData: { ...newFormData, ...totals },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),

      removeLineItem: (id) =>
        set((state) => {
          const lineItems = state.formData.lineItems.filter((item) => item.id !== id)
          const newFormData = { ...state.formData, lineItems }
          const totals = calculateTotals(newFormData)
          return {
            formData: { ...newFormData, ...totals },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),

      recalculateTotals: () =>
        set((state) => {
          const totals = calculateTotals(state.formData)
          return {
            formData: { ...state.formData, ...totals },
          }
        }),

      initializeFromAccount: (accountId, accountName) =>
        set((state) => ({
          formData: {
            ...state.formData,
            accountId,
            accountName,
          },
        })),

      initializeFromTimesheets: (timesheetIds, timesheetData) =>
        set((state) => {
          const newFormData = {
            ...state.formData,
            sourceTimesheetIds: timesheetIds,
            lineItems: timesheetData.lineItems,
            accountId: timesheetData.accountId,
            accountName: timesheetData.accountName,
            companyId: timesheetData.companyId,
            companyName: timesheetData.companyName,
          }
          const totals = calculateTotals(newFormData)
          return {
            formData: { ...newFormData, ...totals },
            isDirty: true,
            lastSaved: new Date(),
          }
        }),
    }),
    {
      name: 'invoice-create-form',
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

export const INVOICE_TYPES = [
  { value: 'standard', label: 'Standard Invoice', description: 'Time and materials based on timesheets' },
  { value: 'fixed_fee', label: 'Fixed Fee', description: 'Fixed project or service fee' },
  { value: 'retainer', label: 'Retainer', description: 'Monthly retainer fee' },
  { value: 'milestone', label: 'Milestone', description: 'Project milestone payment' },
  { value: 'credit_note', label: 'Credit Note', description: 'Credit or adjustment to previous invoice' },
  { value: 'final', label: 'Final Invoice', description: 'Final invoice for contract/project' },
] as const

export const UNIT_TYPES = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'units', label: 'Units' },
  { value: 'fixed', label: 'Fixed Fee' },
] as const

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'CA$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
] as const

export const DISCOUNT_TYPES = [
  { value: 'none', label: 'No Discount' },
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount Discount' },
] as const

// ============================================
// WIZARD STEP CONFIGURATION
// ============================================

export const INVOICE_WIZARD_STEPS = [
  {
    number: 1,
    id: 'client',
    label: 'Client Selection',
    description: 'Select the client and billing contact',
  },
  {
    number: 2,
    id: 'details',
    label: 'Invoice Details',
    description: 'Set invoice type, dates, and payment terms',
  },
  {
    number: 3,
    id: 'lineItems',
    label: 'Line Items',
    description: 'Add services, hours, or expenses',
  },
  {
    number: 4,
    id: 'review',
    label: 'Review & Send',
    description: 'Review invoice and add notes',
  },
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

export function generateTempLineItemId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function createEmptyLineItem(): InvoiceLineItemDraft {
  return {
    id: generateTempLineItemId(),
    description: '',
    serviceStartDate: '',
    serviceEndDate: '',
    quantity: 0,
    unitType: 'hours',
    unitRate: 0,
    discountAmount: 0,
    taxRate: 0,
    timesheetId: null,
    timesheetEntryId: null,
    placementId: null,
    glCode: null,
    costCenter: null,
    projectCode: null,
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateDueDate(invoiceDate: string, daysUntilDue: number): string {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + daysUntilDue)
  return date.toISOString().split('T')[0]
}
