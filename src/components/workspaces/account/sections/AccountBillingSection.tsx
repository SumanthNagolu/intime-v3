'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard, DollarSign, Clock, Receipt,
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import {
  UnifiedSection,
  InfoCard,
  InfoRow,
  CardsGrid,
  EditPanelSection,
} from '@/components/pcf/sections/UnifiedSection'
import { CurrencyDisplay } from '@/components/ui/currency-input'
import { PercentageDisplay } from '@/components/ui/percentage-input'
import { formatSnakeCase } from '@/lib/formatters'

// Constants
const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'due_on_receipt', label: 'Due on Receipt' },
]

const INVOICE_METHODS = [
  { value: 'email', label: 'Email' },
  { value: 'portal', label: 'Client Portal' },
  { value: 'mail', label: 'Physical Mail' },
  { value: 'edi', label: 'EDI' },
]

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
]

const CREDIT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'declined', label: 'Declined' },
]

interface AccountBillingSectionProps {
  account: AccountData
}

/**
 * AccountBillingSection - Billing & Terms
 * Displays billing configuration, payment terms, and financial settings
 * Matches wizard Step 3: Billing & Terms
 */
export function AccountBillingSection({ account }: AccountBillingSectionProps) {
  const { refreshData } = useAccountWorkspace()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState({
    defaultPaymentTerms: account.default_payment_terms || '',
    invoiceDeliveryMethod: account.invoice_delivery_method || '',
    defaultCurrency: account.default_currency || 'USD',
    defaultMarkupPercentage: account.default_markup_percentage?.toString() || '',
    defaultFeePercentage: account.default_fee_percentage?.toString() || '',
    creditStatus: account.credit_status || '',
    creditLimit: account.credit_limit?.toString() || '',
    requiresPo: account.requires_po || false,
    requiresApprovalForSubmission: account.requires_approval_for_submission || false,
  })

  // Reset form when account changes or panel opens
  React.useEffect(() => {
    if (isEditing) {
      setFormData({
        defaultPaymentTerms: account.default_payment_terms || '',
        invoiceDeliveryMethod: account.invoice_delivery_method || '',
        defaultCurrency: account.default_currency || 'USD',
        defaultMarkupPercentage: account.default_markup_percentage?.toString() || '',
        defaultFeePercentage: account.default_fee_percentage?.toString() || '',
        creditStatus: account.credit_status || '',
        creditLimit: account.credit_limit?.toString() || '',
        requiresPo: account.requires_po || false,
        requiresApprovalForSubmission: account.requires_approval_for_submission || false,
      })
    }
  }, [account, isEditing])

  // Update mutation
  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Billing settings updated successfully' })
      refreshData()
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error updating billing settings', description: error.message, variant: 'error' })
    },
  })

  // Handle form submission
  const handleSave = async () => {
    // Map payment terms to days
    const paymentTermsDaysMap: Record<string, number> = {
      'net_15': 15,
      'net_30': 30,
      'net_45': 45,
      'net_60': 60,
      'due_on_receipt': 0,
    }

    await updateMutation.mutateAsync({
      id: account.id,
      paymentTermsDays: formData.defaultPaymentTerms ? paymentTermsDaysMap[formData.defaultPaymentTerms] : undefined,
      billingFrequency: formData.invoiceDeliveryMethod === 'email' ? 'monthly' as const : undefined,
      poRequired: formData.requiresPo,
    })
  }

  return (
    <UnifiedSection
      title="Billing & Terms"
      description="Payment terms, rates, and billing configuration"
      icon={CreditCard}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      editContent={
        <div className="space-y-6">
          <EditPanelSection title="Payment Terms">
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentTerms">Default Payment Terms</Label>
                <Select
                  value={formData.defaultPaymentTerms}
                  onValueChange={(v) => setFormData({ ...formData, defaultPaymentTerms: v })}
                >
                  <SelectTrigger id="paymentTerms">
                    <SelectValue placeholder="Select payment terms" />
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
              <div>
                <Label htmlFor="invoiceMethod">Invoice Delivery Method</Label>
                <Select
                  value={formData.invoiceDeliveryMethod}
                  onValueChange={(v) => setFormData({ ...formData, invoiceDeliveryMethod: v })}
                >
                  <SelectTrigger id="invoiceMethod">
                    <SelectValue placeholder="Select delivery method" />
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
              <div>
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={formData.defaultCurrency}
                  onValueChange={(v) => setFormData({ ...formData, defaultCurrency: v })}
                >
                  <SelectTrigger id="currency">
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
            </div>
          </EditPanelSection>

          <EditPanelSection title="Rate Configuration">
            <div className="space-y-4">
              <div>
                <Label htmlFor="markup">Default Markup (%)</Label>
                <Input
                  id="markup"
                  type="number"
                  value={formData.defaultMarkupPercentage}
                  onChange={(e) => setFormData({ ...formData, defaultMarkupPercentage: e.target.value })}
                  placeholder="e.g., 25"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="fee">Default Fee (%)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.defaultFeePercentage}
                  onChange={(e) => setFormData({ ...formData, defaultFeePercentage: e.target.value })}
                  placeholder="e.g., 15"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </EditPanelSection>

          <EditPanelSection title="Credit Information">
            <div className="space-y-4">
              <div>
                <Label htmlFor="creditStatus">Credit Status</Label>
                <Select
                  value={formData.creditStatus}
                  onValueChange={(v) => setFormData({ ...formData, creditStatus: v })}
                >
                  <SelectTrigger id="creditStatus">
                    <SelectValue placeholder="Select credit status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="e.g., 100000"
                  step="1000"
                  min="0"
                />
              </div>
            </div>
          </EditPanelSection>

          <EditPanelSection title="PO Configuration">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requiresPo">Requires Purchase Order</Label>
                  <p className="text-xs text-charcoal-500">PO number required on all invoices</p>
                </div>
                <Switch
                  id="requiresPo"
                  checked={formData.requiresPo}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresPo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requiresApproval">Requires Submission Approval</Label>
                  <p className="text-xs text-charcoal-500">Manager approval before candidate submission</p>
                </div>
                <Switch
                  id="requiresApproval"
                  checked={formData.requiresApprovalForSubmission}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresApprovalForSubmission: checked })}
                />
              </div>
            </div>
          </EditPanelSection>
        </div>
      }
      editPanel={{
        title: 'Edit Billing & Terms',
        description: 'Update payment terms, rates, and billing configuration',
        width: 'lg',
        onSave: handleSave,
        isSaving: updateMutation.isPending,
      }}
    >
      {/* Cards Grid */}
      <CardsGrid columns={2}>
        {/* Payment Terms Card */}
        <InfoCard
          title="Payment Terms"
          icon={Clock}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <InfoRow
            label="Default Payment Terms"
            value={account.default_payment_terms ? formatSnakeCase(account.default_payment_terms) : null}
          />
          <InfoRow
            label="Invoice Delivery Method"
            value={account.invoice_delivery_method ? formatSnakeCase(account.invoice_delivery_method) : null}
          />
          <InfoRow
            label="Default Currency"
            value={account.default_currency || 'USD'}
          />
        </InfoCard>

        {/* Rate Configuration Card */}
        <InfoCard
          title="Rate Configuration"
          icon={DollarSign}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <div>
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Default Markup
            </p>
            <div className="mt-1">
              <PercentageDisplay
                value={account.default_markup_percentage}
                showProgress={false}
              />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Default Fee
            </p>
            <div className="mt-1">
              <PercentageDisplay
                value={account.default_fee_percentage}
                showProgress={false}
              />
            </div>
          </div>
        </InfoCard>

        {/* Credit Information Card */}
        <InfoCard
          title="Credit Information"
          icon={CreditCard}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <InfoRow
            label="Credit Status"
            value={account.credit_status}
            badge={true}
          />
          <div>
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Credit Limit
            </p>
            <div className="mt-1">
              <CurrencyDisplay
                value={{ amount: account.credit_limit, currency: 'USD' }}
                size="default"
              />
            </div>
          </div>
        </InfoCard>

        {/* PO Configuration Card */}
        <InfoCard
          title="PO Configuration"
          icon={Receipt}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <InfoRow
            label="Requires PO"
            value={account.requires_po ? 'Yes - PO Required' : 'No - PO Optional'}
            badge={true}
            badgeVariant={account.requires_po ? 'warning' : 'secondary'}
          />
          <InfoRow
            label="Requires Approval"
            value={account.requires_approval_for_submission ? 'Yes' : 'No'}
            badge={true}
            badgeVariant={account.requires_approval_for_submission ? 'warning' : 'secondary'}
          />
        </InfoCard>
      </CardsGrid>

      {/* Financial Metrics Summary */}
      <InfoCard
        title="Financial Summary"
        icon={DollarSign}
        iconBg="bg-charcoal-100"
        iconColor="text-charcoal-600"
        className="mt-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Lifetime Revenue
            </p>
            <div className="mt-1">
              <CurrencyDisplay
                value={{ amount: account.lifetime_revenue, currency: 'USD' }}
                size="lg"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Revenue YTD
            </p>
            <div className="mt-1">
              <CurrencyDisplay
                value={{ amount: account.revenue_ytd, currency: 'USD' }}
                size="lg"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Last 12 Months
            </p>
            <div className="mt-1">
              <CurrencyDisplay
                value={{ amount: account.revenue_last_12m, currency: 'USD' }}
                size="lg"
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
              Avg Margin
            </p>
            <div className="mt-1">
              <PercentageDisplay
                value={account.avg_margin_percentage}
                showProgress={false}
                size="lg"
              />
            </div>
          </div>
        </div>
      </InfoCard>
    </UnifiedSection>
  )
}

export default AccountBillingSection
