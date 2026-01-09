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
import {
  useCreateAccountStore,
  BILLING_FREQUENCIES,
  PAYMENT_TERMS,
} from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Building2,
  Mail,
  MapPin,
  Calendar,
  FileCheck,
  CheckCircle2,
  Banknote,
  Receipt
} from 'lucide-react'

// Payment terms card selector
function PaymentTermsSelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {PAYMENT_TERMS.map((term) => {
        const isSelected = selected === term.value
        return (
          <button
            key={term.value}
            type="button"
            onClick={() => onChange(term.value)}
            className={cn(
              'relative p-4 rounded-xl border-2 text-center transition-all duration-300',
              isSelected
                ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500" />
              </div>
            )}
            <span
              className={cn(
                'text-sm font-semibold',
                isSelected ? 'text-gold-700' : 'text-charcoal-700'
              )}
            >
              {term.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Billing frequency selector
function BillingFrequencySelector({
  selected,
  onChange,
}: {
  selected: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {BILLING_FREQUENCIES.map((freq) => {
        const isSelected = selected === freq.value
        return (
          <button
            key={freq.value}
            type="button"
            onClick={() => onChange(freq.value)}
            className={cn(
              'relative p-4 rounded-xl border-2 text-center transition-all duration-300',
              isSelected
                ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
            )}
          >
            {isSelected && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-4 h-4 text-gold-500" />
              </div>
            )}
            <Calendar
              className={cn(
                'w-5 h-5 mx-auto mb-2',
                isSelected ? 'text-gold-500' : 'text-charcoal-400'
              )}
            />
            <span
              className={cn(
                'text-sm font-semibold',
                isSelected ? 'text-gold-700' : 'text-charcoal-700'
              )}
            >
              {freq.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function AccountIntakeStep4Billing() {
  const { formData, setFormData } = useCreateAccountStore()

  // Find billing addresses from addresses list
  const billingAddresses = formData.addresses.filter(a => a.type === 'billing' || a.isPrimary)
  
  return (
    <div className="space-y-10">
      {/* Billing Entity Section */}
      <Section
        icon={Building2}
        title="Billing Entity"
        subtitle="Legal entity details for invoicing"
      >
        <div className="space-y-2">
          <Label htmlFor="billingEntityName" className="text-charcoal-700 font-medium">
            Legal Billing Entity Name
          </Label>
          <Input
            id="billingEntityName"
            value={formData.billingEntityName}
            onChange={(e) => setFormData({ billingEntityName: e.target.value })}
            placeholder="Legal name as it should appear on invoices"
            className="h-12 rounded-xl border-charcoal-200 bg-white"
          />
        </div>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="billingEmail" className="text-charcoal-700 font-medium">
              Billing Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
              <Input
                id="billingEmail"
                type="email"
                value={formData.billingEmail}
                onChange={(e) => setFormData({ billingEmail: e.target.value })}
                placeholder="ap@company.com"
                className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <PhoneInput
              label="Billing Phone"
              value={formData.billingPhone}
              onChange={(billingPhone) => setFormData({ billingPhone })}
            />
          </div>
        </FieldGroup>
        
        {/* Billing Address Selection */}
         <div className="space-y-2">
           <Label htmlFor="billingAddress" className="text-charcoal-700 font-medium">
             Billing Address
           </Label>
            {billingAddresses.length > 0 ? (
              <Select
                value={formData.billingAddress}
                onValueChange={(v) => setFormData({ billingAddress: v })}
              >
                 <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Select billing address" />
                </SelectTrigger>
                <SelectContent>
                   {billingAddresses.map(addr => (
                     <SelectItem key={addr.id} value={addr.id}>
                        {addr.addressLine1}, {addr.city} {addr.type === 'billing' ? '(Billing)' : '(Primary)'}
                     </SelectItem>
                   ))}
                   <SelectItem value="custom">Use a different address...</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                 id="billingAddress"
                 value={formData.billingAddress}
                 onChange={(e) => setFormData({ billingAddress: e.target.value })}
                 placeholder="Enter billing address or add one in Locations step"
                 className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            )}
             {/* If custom or manual entry is allowed/needed, handling it might be more complex 
                 but keeping it simple for now as text if no addresses or specific selection
             */}
         </div>
      </Section>

      {/* Payment Configuration */}
      <Section
        icon={CreditCard}
        title="Payment Configuration"
        subtitle="Invoice and payment terms"
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-charcoal-700 font-medium">
              Billing Frequency
            </Label>
            <BillingFrequencySelector
              selected={formData.billingFrequency}
              onChange={(value) =>
                setFormData({
                  billingFrequency: value as typeof formData.billingFrequency,
                })
              }
            />
          </div>

          <div className="space-y-3">
            <Label className="text-charcoal-700 font-medium">
              Payment Terms
            </Label>
            <PaymentTermsSelector
              selected={formData.paymentTermsDays}
              onChange={(value) => setFormData({ paymentTermsDays: value })}
            />
          </div>

           <FieldGroup cols={2}>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-charcoal-700 font-medium">Default Currency</Label>
                <div className="relative">
                   <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                   <Select
                    value={formData.currency}
                    onValueChange={(v) => setFormData({ currency: v })}
                   >
                     <SelectTrigger className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white">
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
               <div className="space-y-2">
                <Label htmlFor="invoiceFormat" className="text-charcoal-700 font-medium">Invoice Format</Label>
                 <div className="relative">
                   <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                   <Select
                    value={formData.invoiceFormat}
                    onValueChange={(v) => setFormData({ invoiceFormat: v })}
                   >
                     <SelectTrigger className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="standard">Standard Detailed</SelectItem>
                       <SelectItem value="consolidated">Consolidated</SelectItem>
                       <SelectItem value="summary">Summary Only</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>
           </FieldGroup>
        </div>
      </Section>

      {/* PO Required Section */}
      <Section icon={FileCheck} title="Purchase Order Requirements">
        <label
          className={cn(
            'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300',
            formData.poRequired
              ? 'border-gold-400 bg-gradient-to-r from-gold-50 to-amber-50 shadow-gold-glow'
              : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
          )}
        >
          <Checkbox
            checked={formData.poRequired}
            onCheckedChange={(checked) => setFormData({ poRequired: !!checked })}
            className={cn(
              'w-5 h-5 border-2 transition-colors',
              formData.poRequired
                ? 'border-gold-500 data-[state=checked]:bg-gold-500'
                : 'border-charcoal-300'
            )}
          />
          <div className="flex-1">
            <span
              className={cn(
                'text-sm font-semibold block',
                formData.poRequired ? 'text-gold-700' : 'text-charcoal-700'
              )}
            >
              Purchase Order Required
            </span>
            <span className="text-xs text-charcoal-500 block mt-0.5">
              Client requires a PO number before invoicing can begin
            </span>
          </div>
          {formData.poRequired && (
            <CheckCircle2 className="w-5 h-5 text-gold-500" />
          )}
        </label>

        {formData.poRequired && (
          <div className="animate-fade-in pt-4">
             <FieldGroup cols={2}>
               <div className="space-y-2">
                  <Label htmlFor="currentPoNumber" className="text-charcoal-700 font-medium">Current PO Number</Label>
                  <Input
                    id="currentPoNumber"
                    value={formData.currentPoNumber}
                    onChange={(e) => setFormData({ currentPoNumber: e.target.value })}
                    className="h-12 rounded-xl border-charcoal-200 bg-white"
                  />
               </div>
                <div className="space-y-2">
                  <Label htmlFor="poExpiration" className="text-charcoal-700 font-medium">PO Expiration Date</Label>
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <Input
                        id="poExpiration"
                        type="date"
                        className="pl-11 h-12 rounded-xl border-charcoal-200 bg-white"
                        value={formData.poExpirationDate || ''}
                        onChange={(e) => setFormData({ poExpirationDate: e.target.value })}
                      />
                   </div>
               </div>
             </FieldGroup>
          </div>
        )}
      </Section>
    </div>
  )
}




