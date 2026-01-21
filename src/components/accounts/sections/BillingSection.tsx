'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  CreditCard,
  DollarSign,
  Clock,
  Receipt,
  Building2,
  Mail,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import {
  BILLING_FREQUENCIES,
  PAYMENT_TERMS,
  CURRENCIES,
  INVOICE_FORMATS,
  INVOICE_METHODS,
  CREDIT_STATUSES,
  formatCurrency,
  formatPercentage,
} from '@/lib/accounts/constants'
import type { SectionMode, BillingSectionData } from '@/lib/accounts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface BillingSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: BillingSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
  /** Financial summary data (for view mode) */
  financialSummary?: {
    lifetimeRevenue?: number | null
    revenueYtd?: number | null
    revenueLast12m?: number | null
    avgMarginPercentage?: number | null
  }
}

/**
 * BillingSection - Unified component for Billing & Terms
 *
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent field groupings across wizard and detail view
 * - Mode determines editability, not layout
 */
export function BillingSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  financialSummary,
}: BillingSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Get credit status styling
  const getCreditStatusVariant = (status: string | null | undefined): 'secondary' | 'success' | 'warning' | 'destructive' => {
    if (!status) return 'secondary'
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'suspended':
      case 'declined':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // Convert constants to option format for UnifiedField
  const paymentTermsOptions = PAYMENT_TERMS.map(t => ({ value: t.value, label: t.label }))
  const billingFreqOptions = BILLING_FREQUENCIES.map(f => ({ value: f.value, label: f.label }))
  const currencyOptions = CURRENCIES.map(c => ({ value: c.value, label: c.label }))
  const invoiceFormatOptions = INVOICE_FORMATS.map(f => ({ value: f.value, label: f.label }))
  const invoiceMethodOptions = INVOICE_METHODS.map(m => ({ value: m.value, label: m.label }))
  const creditStatusOptions = CREDIT_STATUSES.map(s => ({ value: s.value, label: s.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Billing & Terms"
          subtitle="Payment terms, rates, and billing configuration"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid - Same structure in all modes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Billing Entity Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Billing Entity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Billing Entity Name"
              value={data.billingEntityName}
              onChange={(v) => handleChange('billingEntityName', v)}
              editable={isEditable}
              placeholder="e.g., Acme Corporation - Accounts Payable"
            />
            <UnifiedField
              label="Billing Email"
              type="email"
              value={data.billingEmail}
              onChange={(v) => handleChange('billingEmail', v)}
              editable={isEditable}
              placeholder="billing@example.com"
            />
            <UnifiedField
              label="Billing Phone"
              type="phone"
              value={data.billingPhone}
              onChange={(v) => handleChange('billingPhone', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* Payment Terms Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Payment Terms</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Payment Terms"
              type="select"
              options={paymentTermsOptions}
              value={data.paymentTermsDays}
              onChange={(v) => handleChange('paymentTermsDays', v)}
              editable={isEditable}
              placeholder="Select terms"
            />
            <UnifiedField
              label="Billing Frequency"
              type="select"
              options={billingFreqOptions}
              value={data.billingFrequency}
              onChange={(v) => handleChange('billingFrequency', v)}
              editable={isEditable}
              placeholder="Select frequency"
            />
            <UnifiedField
              label="Invoice Delivery"
              type="select"
              options={invoiceMethodOptions}
              value={data.invoiceDeliveryMethod}
              onChange={(v) => handleChange('invoiceDeliveryMethod', v)}
              editable={isEditable}
              placeholder="Select method"
            />
            <UnifiedField
              label="Currency"
              type="select"
              options={currencyOptions}
              value={data.currency}
              onChange={(v) => handleChange('currency', v)}
              editable={isEditable}
              placeholder="Select currency"
            />
          </CardContent>
        </Card>

        {/* Rate Configuration Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Rate Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Default Markup"
              type="percentage"
              value={data.defaultMarkupPercentage}
              onChange={(v) => handleChange('defaultMarkupPercentage', v)}
              editable={isEditable}
              min={0}
              max={100}
              step={0.1}
              placeholder="e.g., 25"
            />
            <UnifiedField
              label="Default Fee"
              type="percentage"
              value={data.defaultFeePercentage}
              onChange={(v) => handleChange('defaultFeePercentage', v)}
              editable={isEditable}
              min={0}
              max={100}
              step={0.1}
              placeholder="e.g., 15"
            />
            <UnifiedField
              label="Invoice Format"
              type="select"
              options={invoiceFormatOptions}
              value={data.invoiceFormat}
              onChange={(v) => handleChange('invoiceFormat', v)}
              editable={isEditable}
              placeholder="Select format"
            />
          </CardContent>
        </Card>

        {/* Credit Information Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Credit Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Credit Status"
              type="select"
              options={creditStatusOptions}
              value={data.creditStatus}
              onChange={(v) => handleChange('creditStatus', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getCreditStatusVariant(data.creditStatus)}
              placeholder="Select status"
            />
            <UnifiedField
              label="Credit Limit"
              type="currency"
              value={data.creditLimit}
              onChange={(v) => handleChange('creditLimit', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* PO Configuration Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Receipt className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">PO Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedField
                label="Requires PO"
                type="switch"
                value={data.poRequired}
                onChange={(v) => handleChange('poRequired', v)}
                editable={isEditable}
                helpText="PO number required on all invoices"
              />
              <UnifiedField
                label="Requires Submission Approval"
                type="switch"
                value={data.requiresApprovalForSubmission}
                onChange={(v) => handleChange('requiresApprovalForSubmission', v)}
                editable={isEditable}
                helpText="Manager approval before candidate submission"
              />
              {data.poRequired && (
                <>
                  <UnifiedField
                    label="Current PO Number"
                    value={data.currentPoNumber}
                    onChange={(v) => handleChange('currentPoNumber', v)}
                    editable={isEditable}
                    placeholder="e.g., PO-2024-001"
                  />
                  <UnifiedField
                    label="PO Expiration"
                    type="date"
                    value={data.poExpirationDate}
                    onChange={(v) => handleChange('poExpirationDate', v)}
                    editable={isEditable}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics Summary - only show in view/edit mode with data */}
      {!isCreateMode && financialSummary && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Building2 className="w-4 h-4 text-charcoal-600" />
              </div>
              <CardTitle className="text-base font-heading">Financial Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard
                label="Lifetime Revenue"
                value={formatCurrency(financialSummary.lifetimeRevenue)}
              />
              <MetricCard
                label="Revenue YTD"
                value={formatCurrency(financialSummary.revenueYtd)}
              />
              <MetricCard
                label="Last 12 Months"
                value={formatCurrency(financialSummary.revenueLast12m)}
              />
              <MetricCard
                label="Avg Margin"
                value={formatPercentage(financialSummary.avgMarginPercentage)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============ HELPER COMPONENTS ============

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-charcoal-900 mt-1">{value}</p>
    </div>
  )
}

export default BillingSection
