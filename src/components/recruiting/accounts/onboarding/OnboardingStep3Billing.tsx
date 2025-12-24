'use client'

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
import { useAccountOnboardingStore, PAYMENT_TERMS, BILLING_FREQUENCIES } from '@/stores/account-onboarding-store'

export function OnboardingStep3Billing() {
  const { formData, setFormData } = useAccountOnboardingStore()

  return (
    <div className="space-y-6">
      {/* Billing Entity */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Billing Entity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Billing Entity Name</Label>
            <Input
              value={formData.billingEntityName}
              onChange={(e) => setFormData({ billingEntityName: e.target.value })}
              placeholder="If different from company name"
            />
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select
              value={formData.billingCurrency}
              onValueChange={(v) => setFormData({ billingCurrency: v })}
            >
              <SelectTrigger>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select
              value={formData.paymentTerms}
              onValueChange={(v) => setFormData({ paymentTerms: v })}
            >
              <SelectTrigger>
                <SelectValue />
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
            <Label>Billing Frequency</Label>
            <Select
              value={formData.billingFrequency}
              onValueChange={(v) => setFormData({ billingFrequency: v })}
            >
              <SelectTrigger>
                <SelectValue />
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
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Billing Address
        </h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.useSameAddress}
            onCheckedChange={(checked) => setFormData({ useSameAddress: !!checked })}
          />
          <span className="text-sm">Same as headquarters address</span>
        </label>
        {!formData.useSameAddress && (
          <div className="space-y-2">
            <Label>Billing Address</Label>
            <Input
              value={formData.billingAddress}
              onChange={(e) => setFormData({ billingAddress: e.target.value })}
              placeholder="Full billing address"
            />
          </div>
        )}
      </div>

      {/* Billing Contact */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Billing Contact
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input
              value={formData.billingContactName}
              onChange={(e) => setFormData({ billingContactName: e.target.value })}
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.billingContactTitle}
              onChange={(e) => setFormData({ billingContactTitle: e.target.value })}
              placeholder="AP Manager"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.billingContactEmail}
              onChange={(e) => setFormData({ billingContactEmail: e.target.value })}
              placeholder="ap@company.com"
            />
          </div>
          <div className="space-y-2">
            <PhoneInput
              label="Phone"
              value={formData.billingContactPhone && typeof formData.billingContactPhone === 'object' && 'countryCode' in formData.billingContactPhone
                ? formData.billingContactPhone
                : { countryCode: 'US', number: '' }}
              onChange={(phone) => setFormData({ billingContactPhone: phone })}
            />
          </div>
        </div>
      </div>

      {/* PO & Approvals */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Purchase Orders & Approvals
        </h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.poRequired}
            onCheckedChange={(checked) => setFormData({ poRequired: !!checked })}
          />
          <span className="text-sm">Purchase Order required for invoicing</span>
        </label>
        {formData.poRequired && (
          <div className="space-y-2">
            <Label>Initial PO Number</Label>
            <Input
              value={formData.poNumber}
              onChange={(e) => setFormData({ poNumber: e.target.value })}
              placeholder="PO-12345"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timesheet Approver</Label>
            <Input
              value={formData.timesheetApprover}
              onChange={(e) => setFormData({ timesheetApprover: e.target.value })}
              placeholder="Manager name or email"
            />
          </div>
          <div className="space-y-2">
            <Label>Approval Method</Label>
            <Select
              value={formData.approvalMethod}
              onValueChange={(v) => setFormData({ approvalMethod: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Approval</SelectItem>
                <SelectItem value="portal">Client Portal</SelectItem>
                <SelectItem value="vms">VMS System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
