'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Save, Send, FileText, Building2, Calendar, DollarSign, Check, Loader2 } from 'lucide-react'
import { useInvoiceCreateStore, INVOICE_TYPES, INVOICE_WIZARD_STEPS, formatCurrency, createEmptyLineItem } from '@/stores/invoice-create-store'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

function NewInvoiceLoading() {
  return (
    <SidebarLayout sectionId="invoices">
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-charcoal-400" />
      </div>
    </SidebarLayout>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<NewInvoiceLoading />}>
      <NewInvoiceContent />
    </Suspense>
  )
}

function NewInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = parseInt(searchParams.get('step') || '1')

  const { formData, setFormData, setCurrentStep, resetForm, addLineItem, removeLineItem, updateLineItem } = useInvoiceCreateStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: (data) => {
      toast.success('Invoice created successfully')
      resetForm()
      router.push(`/employee/operations/invoices/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create invoice')
      setIsSubmitting(false)
    },
  })

  const navigateToStep = (newStep: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('step', newStep.toString())
    router.push(`?${params.toString()}`, { scroll: false })
    setCurrentStep(newStep)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Validate required fields
    if (!formData.companyId && !formData.accountId) {
      toast.error('Please select a client or company')
      setIsSubmitting(false)
      return
    }

    // Create the invoice
    createMutation.mutate({
      accountId: formData.accountId || undefined,
      // companyId is required - use accountId as fallback if available
      companyId: formData.companyId || formData.accountId || '',
      billingContactId: formData.billingContactId || undefined,
      invoiceType: formData.invoiceType,
      referenceNumber: formData.referenceNumber || undefined,
      invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate,
      paymentTermsId: formData.paymentTermsId || undefined,
      currency: formData.currency,
      paymentInstructions: formData.paymentInstructions || undefined,
      clientNotes: formData.clientNotes || undefined,
      internalNotes: formData.internalNotes || undefined,
      termsAndConditions: formData.termsAndConditions || undefined,
      lineItems: formData.lineItems.map((item, index) => {
        const subtotal = item.quantity * item.unitRate
        const afterDiscount = subtotal - (item.discountAmount || 0)
        const tax = afterDiscount * ((item.taxRate || 0) / 100)
        const totalAmount = afterDiscount + tax

        return {
          lineNumber: index + 1,
          description: item.description,
          serviceStartDate: item.serviceStartDate || undefined,
          serviceEndDate: item.serviceEndDate || undefined,
          quantity: item.quantity,
          unitType: item.unitType,
          unitRate: item.unitRate,
          discountAmount: item.discountAmount || undefined,
          taxAmount: tax || undefined,
          totalAmount,
          taxRate: item.taxRate || undefined,
          timesheetId: item.timesheetId || undefined,
          placementId: item.placementId || undefined,
          glCode: item.glCode || undefined,
          costCenter: item.costCenter || undefined,
          projectCode: item.projectCode || undefined,
        }
      }),
    })
  }

  return (
    <SidebarLayout sectionId="invoices">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal-900">New Invoice</h1>
            <p className="text-charcoal-500 mt-1">Create a new invoice for billing</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/employee/operations/invoices')}>
            Cancel
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-4">
          {INVOICE_WIZARD_STEPS.map((wizardStep, index) => (
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
              {index < INVOICE_WIZARD_STEPS.length - 1 && (
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
                <Building2 className="h-5 w-5 text-charcoal-500" />
                <h2 className="text-lg font-semibold">Client Selection</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    value={formData.accountName}
                    onChange={(e) => setFormData({ accountName: e.target.value })}
                    placeholder="Enter account name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Contact Name</Label>
                  <Input
                    value={formData.billingContactName}
                    onChange={(e) => setFormData({ billingContactName: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.billingContactEmail}
                    onChange={(e) => setFormData({ billingContactEmail: e.target.value })}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-charcoal-500" />
                <h2 className="text-lg font-semibold">Invoice Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Type</Label>
                  <Select
                    value={formData.invoiceType}
                    onValueChange={(value) => setFormData({ invoiceType: value as typeof formData.invoiceType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ referenceNumber: e.target.value })}
                    placeholder="PO# or Reference"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ invoiceDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ currency: value })}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-charcoal-500" />
                  <h2 className="text-lg font-semibold">Line Items</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addLineItem(createEmptyLineItem())}
                >
                  Add Line Item
                </Button>
              </div>

              {formData.lineItems.length === 0 ? (
                <div className="text-center py-8 text-charcoal-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-charcoal-300" />
                  <p>No line items yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => addLineItem(createEmptyLineItem())}
                  >
                    Add First Line Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.lineItems.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-charcoal-500">Line {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-500 hover:text-error-700"
                          onClick={() => removeLineItem(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2 space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                            placeholder="Service description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Unit Rate</Label>
                          <Input
                            type="number"
                            value={item.unitRate}
                            onChange={(e) => updateLineItem(item.id, { unitRate: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-right text-sm">
                        <span className="text-charcoal-500">Line Total: </span>
                        <span className="font-medium">{formatCurrency(item.quantity * item.unitRate)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {formData.lineItems.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Subtotal</span>
                        <span className="font-medium">{formatCurrency(formData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Discount</span>
                        <span className="font-medium">-{formatCurrency(formData.totalDiscount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Tax</span>
                        <span className="font-medium">{formatCurrency(formData.totalTax)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold text-lg">{formatCurrency(formData.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-charcoal-500" />
                <h2 className="text-lg font-semibold">Review & Additional Details</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Instructions</Label>
                    <Textarea
                      value={formData.paymentInstructions}
                      onChange={(e) => setFormData({ paymentInstructions: e.target.value })}
                      placeholder="Instructions for payment..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Notes (visible to client)</Label>
                    <Textarea
                      value={formData.clientNotes}
                      onChange={(e) => setFormData({ clientNotes: e.target.value })}
                      placeholder="Notes for the client..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Internal Notes (not visible to client)</Label>
                    <Textarea
                      value={formData.internalNotes}
                      onChange={(e) => setFormData({ internalNotes: e.target.value })}
                      placeholder="Internal notes..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="p-4 bg-charcoal-50">
                    <h3 className="font-semibold mb-3">Invoice Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Client</span>
                        <span>{formData.companyName || formData.accountName || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Type</span>
                        <span className="capitalize">{formData.invoiceType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Date</span>
                        <span>{formData.invoiceDate || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Due</span>
                        <span>{formData.dueDate || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Line Items</span>
                        <span>{formData.lineItems.length}</span>
                      </div>
                    </div>
                    <div className="border-t mt-3 pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total Amount</span>
                        <span className="text-lg">{formatCurrency(formData.totalAmount)}</span>
                      </div>
                    </div>
                  </Card>
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
              <Button onClick={() => navigateToStep(step + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || formData.lineItems.length === 0}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
