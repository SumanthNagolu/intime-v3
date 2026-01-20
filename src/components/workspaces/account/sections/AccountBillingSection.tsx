'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import {
  CreditCard, DollarSign, Clock, CheckCircle2, AlertTriangle,
  Receipt, Pencil, Building2, Loader2
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

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

  // Format currency
  const formatCurrency = (value: string | number | null) => {
    if (!value) return 'Not specified'
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
  }

  // Format percentage
  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return 'Not specified'
    return `${value}%`
  }

  // Get credit status styling
  const getCreditStatusStyle = (status: string | null) => {
    if (!status) return { variant: 'secondary' as const, icon: null }
    switch (status.toLowerCase()) {
      case 'approved':
        return { variant: 'success' as const, icon: CheckCircle2 }
      case 'pending':
        return { variant: 'warning' as const, icon: Clock }
      case 'suspended':
      case 'declined':
        return { variant: 'destructive' as const, icon: AlertTriangle }
      default:
        return { variant: 'secondary' as const, icon: null }
    }
  }

  const creditStatusStyle = getCreditStatusStyle(account.credit_status)

  return (
    <div className="flex gap-0">
      {/* Main Content */}
      <div className={cn("space-y-6 animate-fade-in flex-1 transition-all", isEditing && "pr-0")}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-charcoal-900">Billing & Terms</h2>
            <p className="text-sm text-charcoal-500 mt-1">Payment terms, rates, and billing configuration</p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

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
            <InfoRow
              label="Default Payment Terms"
              value={formatPaymentTerms(account.default_payment_terms)}
            />
            <InfoRow
              label="Invoice Delivery Method"
              value={account.invoice_delivery_method}
            />
            <InfoRow
              label="Default Currency"
              value={account.default_currency || 'USD'}
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
            <InfoRow
              label="Default Markup"
              value={formatPercentage(account.default_markup_percentage)}
            />
            <InfoRow
              label="Default Fee"
              value={formatPercentage(account.default_fee_percentage)}
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
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Credit Status</p>
              {account.credit_status ? (
                <Badge variant={creditStatusStyle.variant} className="mt-1 capitalize gap-1">
                  {creditStatusStyle.icon && <creditStatusStyle.icon className="w-3 h-3" />}
                  {account.credit_status.replace(/_/g, ' ')}
                </Badge>
              ) : (
                <span className="text-sm text-charcoal-400">Not specified</span>
              )}
            </div>
            <InfoRow
              label="Credit Limit"
              value={formatCurrency(account.credit_limit)}
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
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Requires PO</p>
              <Badge
                variant={account.requires_po ? 'warning' : 'secondary'}
                className="mt-1"
              >
                {account.requires_po ? 'Yes - PO Required' : 'No - PO Optional'}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Requires Approval for Submission</p>
              <Badge
                variant={account.requires_approval_for_submission ? 'warning' : 'secondary'}
                className="mt-1"
              >
                {account.requires_approval_for_submission ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics Summary */}
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
              value={formatCurrency(account.lifetime_revenue)}
              trend={null}
            />
            <MetricCard
              label="Revenue YTD"
              value={formatCurrency(account.revenue_ytd)}
              trend={null}
            />
            <MetricCard
              label="Last 12 Months"
              value={formatCurrency(account.revenue_last_12m)}
              trend={null}
            />
            <MetricCard
              label="Avg Margin"
              value={formatPercentage(account.avg_margin_percentage)}
              trend={null}
            />
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Edit Panel */}
      <InlinePanel
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Billing & Terms"
        description="Update payment terms, rates, and billing configuration"
        width="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <InlinePanelSection title="Payment Terms">
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
          </InlinePanelSection>

          <InlinePanelSection title="Rate Configuration">
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
          </InlinePanelSection>

          <InlinePanelSection title="Credit Information">
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
          </InlinePanelSection>

          <InlinePanelSection title="PO Configuration">
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
          </InlinePanelSection>
        </div>
      </InlinePanel>
    </div>
  )
}

// Helper Components
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <p className={cn("text-sm mt-0.5", value && value !== 'Not specified' ? "text-charcoal-900" : "text-charcoal-400")}>
        {value || 'Not specified'}
      </p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  trend
}: {
  label: string
  value: string
  trend: 'up' | 'down' | null
}) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-charcoal-900 mt-1">{value}</p>
    </div>
  )
}

// Formatting helpers
function formatPaymentTerms(terms: string | null): string | null {
  if (!terms) return null
  const map: Record<string, string> = {
    'net_15': 'Net 15',
    'net_30': 'Net 30',
    'net_45': 'Net 45',
    'net_60': 'Net 60',
    'due_on_receipt': 'Due on Receipt',
  }
  return map[terms] || terms.replace(/_/g, ' ')
}

export default AccountBillingSection
