'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Building2,
} from 'lucide-react'
import { SectionWrapper } from '../layouts/SectionHeader'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import { FieldGrid } from '../layouts/FieldGrid'
import {
  BILLING_FREQUENCIES,
  PAYMENT_TERMS,
  CURRENCIES,
  INVOICE_FORMATS,
  INVOICE_METHODS,
  CREDIT_STATUSES,
  formatCurrency,
  formatPercentage,
  getLabel,
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
 * Handles all three modes:
 * - create: Full form for wizard step (Step 3)
 * - view: Read-only card grid for detail page with in-place editing
 * - edit: Same layout as view but fields are editable
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

  const isEditable = mode === 'create' || isEditing

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

  // ============ CREATE MODE ============
  if (mode === 'create') {
    return (
      <div className={cn('space-y-10', className)}>
        {/* Billing Entity */}
        <SectionWrapper
          icon={Building2}
          title="Billing Entity"
          subtitle="Primary billing contact and entity details"
        >
          <FieldGrid cols={2}>
            <div className="md:col-span-2 space-y-2">
              <Label className="text-charcoal-700 font-medium">Billing Entity Name</Label>
              <Input
                value={data.billingEntityName}
                onChange={(e) => handleChange('billingEntityName', e.target.value)}
                placeholder="e.g., Acme Corporation - Accounts Payable"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Billing Email</Label>
              <Input
                type="email"
                value={data.billingEmail}
                onChange={(e) => handleChange('billingEmail', e.target.value)}
                placeholder="billing@example.com"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Billing Phone</Label>
              <PhoneInput
                value={data.billingPhone}
                onChange={(v) => handleChange('billingPhone', v)}
              />
            </div>
          </FieldGrid>
        </SectionWrapper>

        {/* Payment Configuration */}
        <SectionWrapper
          icon={CreditCard}
          title="Payment Configuration"
          subtitle="Payment terms, frequency, and currency"
        >
          <FieldGrid cols={3}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Payment Terms</Label>
              <Select
                value={data.paymentTermsDays}
                onValueChange={(v) => handleChange('paymentTermsDays', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select terms" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Billing Frequency</Label>
              <Select
                value={data.billingFrequency}
                onValueChange={(v) => handleChange('billingFrequency', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Currency</Label>
              <Select
                value={data.currency}
                onValueChange={(v) => handleChange('currency', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGrid>

          <FieldGrid cols={2}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Invoice Format</Label>
              <Select
                value={data.invoiceFormat}
                onValueChange={(v) => handleChange('invoiceFormat', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Invoice Delivery</Label>
              <Select
                value={data.invoiceDeliveryMethod}
                onValueChange={(v) => handleChange('invoiceDeliveryMethod', v)}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGrid>
        </SectionWrapper>

        {/* PO Requirements */}
        <SectionWrapper
          icon={Receipt}
          title="PO Requirements"
          subtitle="Purchase order configuration"
        >
          <div className="space-y-6">
            <label
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300',
                data.poRequired
                  ? 'border-gold-400 bg-gradient-to-r from-gold-50 to-amber-50'
                  : 'border-charcoal-200 hover:border-charcoal-300'
              )}
            >
              <Checkbox
                checked={data.poRequired}
                onCheckedChange={(checked) => handleChange('poRequired', !!checked)}
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-charcoal-800 block">
                  PO Required for Invoicing
                </span>
                <span className="text-xs text-charcoal-500">
                  All invoices must include a valid purchase order number
                </span>
              </div>
              {data.poRequired && <CheckCircle2 className="w-5 h-5 text-gold-500" />}
            </label>

            {data.poRequired && (
              <div className="animate-fade-in">
                <FieldGrid cols={2}>
                  <div className="space-y-2">
                    <Label className="text-charcoal-700 font-medium">Current PO Number</Label>
                    <Input
                      value={data.currentPoNumber}
                      onChange={(e) => handleChange('currentPoNumber', e.target.value)}
                      placeholder="e.g., PO-2024-001"
                      className="h-12 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-charcoal-700 font-medium">PO Expiration Date</Label>
                    <Input
                      type="date"
                      value={data.poExpirationDate || ''}
                      onChange={(e) => handleChange('poExpirationDate', e.target.value || null)}
                      className="h-12 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </FieldGrid>
              </div>
            )}
          </div>
        </SectionWrapper>

        {/* Rate Configuration */}
        <SectionWrapper
          icon={DollarSign}
          title="Rate Configuration"
          subtitle="Default markup and fee percentages"
        >
          <FieldGrid cols={2}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Default Markup (%)</Label>
              <Input
                type="number"
                value={data.defaultMarkupPercentage}
                onChange={(e) => handleChange('defaultMarkupPercentage', e.target.value)}
                placeholder="e.g., 25"
                min={0}
                max={100}
                step={0.1}
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Default Fee (%)</Label>
              <Input
                type="number"
                value={data.defaultFeePercentage}
                onChange={(e) => handleChange('defaultFeePercentage', e.target.value)}
                placeholder="e.g., 15"
                min={0}
                max={100}
                step={0.1}
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </FieldGrid>
        </SectionWrapper>
      </div>
    )
  }

  // ============ VIEW/EDIT MODE - In-Place Editing ============
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header with Edit/Save/Cancel */}
      <SectionHeader
        title="Billing & Terms"
        subtitle="Payment terms, rates, and billing configuration"
        mode={isEditing ? 'edit' : 'view'}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            />
            <UnifiedField
              label="Billing Frequency"
              type="select"
              options={billingFreqOptions}
              value={data.billingFrequency}
              onChange={(v) => handleChange('billingFrequency', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Invoice Delivery"
              type="select"
              options={invoiceMethodOptions}
              value={data.invoiceDeliveryMethod}
              onChange={(v) => handleChange('invoiceDeliveryMethod', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Currency"
              type="select"
              options={currencyOptions}
              value={data.currency}
              onChange={(v) => handleChange('currency', v)}
              editable={isEditable}
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
            />
          </CardContent>
        </Card>

        {/* Credit Information Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-4 h-4 text-blue-600" />
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
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Receipt className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">PO Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics Summary */}
      {financialSummary && (
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
