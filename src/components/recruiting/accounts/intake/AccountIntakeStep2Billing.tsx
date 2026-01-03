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
import { PostalCodeInput, type PostalCodeCountry } from '@/components/ui/postal-code-input'
import {
  useCreateAccountStore,
  BILLING_FREQUENCIES,
  PAYMENT_TERMS,
} from '@/stores/create-account-store'
import { OPERATING_COUNTRIES, getStatesByCountry } from '@/components/addresses'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Building2,
  Mail,
  MapPin,
  Calendar,
  FileCheck,
  Info,
  CheckCircle2,
} from 'lucide-react'

// Section wrapper component
function Section({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon?: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-amber-100 flex items-center justify-center shadow-sm">
            <Icon className="w-5 h-5 text-gold-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-charcoal-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// Field group for better organization
function FieldGroup({
  children,
  cols = 2,
}: {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }
  return <div className={cn('grid gap-5', gridCols[cols])}>{children}</div>
}

// Info notice component
function InfoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl">
      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
      <p className="text-sm text-blue-700">{children}</p>
    </div>
  )
}

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

export function AccountIntakeStep2Billing() {
  const { formData, setFormData } = useCreateAccountStore()

  return (
    <div className="space-y-10">
      {/* Info Notice */}
      <InfoNotice>
        Billing information is optional at this stage and can be added or
        updated later during account onboarding.
      </InfoNotice>

      {/* Billing Entity Section */}
      <Section
        icon={Building2}
        title="Billing Entity"
        subtitle="Legal entity details for invoicing"
      >
        <div className="space-y-2">
          <Label
            htmlFor="billingEntityName"
            className="text-charcoal-700 font-medium"
          >
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
            <Label
              htmlFor="billingEmail"
              className="text-charcoal-700 font-medium"
            >
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
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">
            Billing Address
          </span>
        </div>
      </div>

      {/* Billing Address Section */}
      <Section
        icon={MapPin}
        title="Billing Address"
        subtitle="Where to send invoices"
      >
        <div className="p-6 bg-gradient-to-br from-charcoal-50/50 to-white border border-charcoal-100 rounded-2xl space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="billingAddress"
              className="text-charcoal-700 font-medium"
            >
              Street Address
            </Label>
            <Input
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => setFormData({ billingAddress: e.target.value })}
              placeholder="123 Billing Street, Suite 100"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label
                htmlFor="billingCity"
                className="text-charcoal-700 font-medium"
              >
                City
              </Label>
              <Input
                id="billingCity"
                value={formData.billingCity}
                onChange={(e) => setFormData({ billingCity: e.target.value })}
                placeholder="City"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="billingState"
                className="text-charcoal-700 font-medium"
              >
                State/Province
              </Label>
              <Select
                value={formData.billingState}
                onValueChange={(v) => setFormData({ billingState: v })}
              >
                <SelectTrigger
                  id="billingState"
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {getStatesByCountry(formData.billingCountry).map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>

          <FieldGroup cols={2}>
            <div className="space-y-2">
              <PostalCodeInput
                value={formData.billingPostalCode}
                onChange={(val) => setFormData({ billingPostalCode: val })}
                countryCode={formData.billingCountry as PostalCodeCountry}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="billingCountry"
                className="text-charcoal-700 font-medium"
              >
                Country
              </Label>
              <Select
                value={formData.billingCountry}
                onValueChange={(v) =>
                  setFormData({
                    billingCountry: v,
                    billingState: '',
                    billingPostalCode: '',
                  })
                }
              >
                <SelectTrigger
                  id="billingCountry"
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                >
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATING_COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">
            Payment Terms
          </span>
        </div>
      </div>

      {/* Payment Terms Section */}
      <Section
        icon={CreditCard}
        title="Payment Terms"
        subtitle="Invoice and payment configuration"
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
      </Section>
    </div>
  )
}




