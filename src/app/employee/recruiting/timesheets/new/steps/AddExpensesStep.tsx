'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Receipt,
  Upload,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TimesheetFormData,
  ExpenseEntry,
  EXPENSE_CATEGORIES,
  formatCurrency,
} from '@/stores/timesheet-entry-store'
import { useTimesheetEntryStore } from '@/stores/timesheet-entry-store'
import { format } from 'date-fns'

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

const DEFAULT_EXPENSE: Omit<ExpenseEntry, 'id'> = {
  expenseDate: format(new Date(), 'yyyy-MM-dd'),
  category: '',
  description: '',
  amount: 0,
  isBillable: true,
  isReimbursable: true,
  receiptUrl: null,
  notes: null,
}

export function AddExpensesStep({
  formData,
  onNext,
  onPrev,
}: StepProps) {
  const { addExpense, updateExpense, removeExpense, getTotalExpenses } = useTimesheetEntryStore()
  const [showForm, setShowForm] = useState(false)
  const [newExpense, setNewExpense] = useState<Omit<ExpenseEntry, 'id'>>(DEFAULT_EXPENSE)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const expenseTotals = getTotalExpenses()

  const handleAddExpense = () => {
    if (editingIndex !== null) {
      updateExpense(editingIndex, newExpense)
      setEditingIndex(null)
    } else {
      addExpense(newExpense)
    }
    setNewExpense(DEFAULT_EXPENSE)
    setShowForm(false)
  }

  const handleEditExpense = (index: number) => {
    const expense = formData.expenses[index]
    setNewExpense(expense)
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleRemoveExpense = (index: number) => {
    removeExpense(index)
  }

  const handleCancelForm = () => {
    setNewExpense(DEFAULT_EXPENSE)
    setEditingIndex(null)
    setShowForm(false)
  }

  const isFormValid = newExpense.category && newExpense.description && newExpense.amount > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-charcoal-500" />
          <div>
            <h3 className="font-medium text-charcoal-900">Expenses (Optional)</h3>
            <p className="text-sm text-charcoal-500">
              Add any billable expenses for this period
            </p>
          </div>
        </div>
        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        )}
      </div>

      {/* Expense Form */}
      {showForm && (
        <div className="p-4 border rounded-lg bg-charcoal-50">
          <h4 className="font-medium mb-4">
            {editingIndex !== null ? 'Edit Expense' : 'New Expense'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expenseDate">Date *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={newExpense.expenseDate}
                onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Describe the expense..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isBillable"
                  checked={newExpense.isBillable}
                  onCheckedChange={(checked) => setNewExpense({ ...newExpense, isBillable: checked as boolean })}
                />
                <Label htmlFor="isBillable" className="text-sm font-normal cursor-pointer">
                  Billable to client
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isReimbursable"
                  checked={newExpense.isReimbursable}
                  onCheckedChange={(checked) => setNewExpense({ ...newExpense, isReimbursable: checked as boolean })}
                />
                <Label htmlFor="isReimbursable" className="text-sm font-normal cursor-pointer">
                  Reimbursable to employee
                </Label>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={newExpense.notes || ''}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value || null })}
                className="mt-1 min-h-[60px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={handleCancelForm}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddExpense} disabled={!isFormValid}>
              {editingIndex !== null ? 'Update Expense' : 'Add Expense'}
            </Button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {formData.expenses.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-charcoal-900">Added Expenses</h4>
          <div className="border rounded-lg divide-y">
            {formData.expenses.map((expense, index) => (
              <div
                key={index}
                className="p-4 flex items-start justify-between hover:bg-charcoal-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-charcoal-900">
                      {expense.description}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-charcoal-100 text-charcoal-600">
                      {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                    </span>
                  </div>
                  <div className="text-sm text-charcoal-500 mt-1">
                    {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {expense.isBillable && (
                      <span className="text-green-600">Billable</span>
                    )}
                    {expense.isReimbursable && (
                      <span className="text-blue-600">Reimbursable</span>
                    )}
                    {expense.notes && (
                      <span className="text-charcoal-500 truncate max-w-[200px]">
                        {expense.notes}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-charcoal-900">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditExpense(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExpense(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Expenses Message */}
      {formData.expenses.length === 0 && !showForm && (
        <div className="p-8 border-2 border-dashed border-charcoal-200 rounded-lg text-center">
          <Receipt className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <h4 className="font-medium text-charcoal-700 mb-1">No expenses added</h4>
          <p className="text-sm text-charcoal-500 mb-4">
            Add any travel, meals, or other reimbursable expenses for this period
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      )}

      {/* Totals Summary */}
      {formData.expenses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-charcoal-50 rounded-lg">
          <div>
            <div className="text-sm text-charcoal-500">Total Expenses</div>
            <div className="text-xl font-medium text-charcoal-900">
              {formatCurrency(expenseTotals.total)}
            </div>
          </div>
          <div>
            <div className="text-sm text-charcoal-500">Billable</div>
            <div className="text-xl font-medium text-green-600">
              {formatCurrency(expenseTotals.billable)}
            </div>
          </div>
          <div>
            <div className="text-sm text-charcoal-500">Reimbursable</div>
            <div className="text-xl font-medium text-blue-600">
              {formatCurrency(expenseTotals.reimbursable)}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" onClick={onNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
