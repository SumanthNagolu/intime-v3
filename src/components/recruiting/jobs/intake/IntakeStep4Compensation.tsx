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
import { useJobIntakeStore, WORK_ARRANGEMENTS, WORK_AUTHORIZATIONS } from '@/stores/job-intake-store'
import { AddressForm } from '@/components/addresses'
import { cn } from '@/lib/utils'
import { MapPin, Shield, DollarSign, Clock, AlertCircle, Home, Building, Building2, TrendingUp, CheckCircle2 } from 'lucide-react'

// Section wrapper component
function Section({ 
  icon: Icon, 
  title, 
  subtitle,
  children,
  className 
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold-600" />
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

export function IntakeStep4Compensation() {
  const { formData, setFormData } = useJobIntakeStore()

  const handleWorkAuthorizationChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({ workAuthorizations: [...formData.workAuthorizations, value] })
    } else {
      setFormData({
        workAuthorizations: formData.workAuthorizations.filter((a) => a !== value),
      })
    }
  }

  // Calculate margin if both rates are provided
  const margin = formData.billRateMin && formData.payRateMin
    ? (((parseFloat(formData.billRateMin) - parseFloat(formData.payRateMin)) / parseFloat(formData.billRateMin)) * 100).toFixed(1)
    : null

  const workArrangementIcons = {
    remote: Home,
    hybrid: Building,
    onsite: Building2,
  }

  return (
    <div className="space-y-10">
      {/* Work Location Section */}
      <Section icon={MapPin} title="Work Location" subtitle="Where will this person work?">
        <div className="space-y-4">
          <Label className="text-charcoal-700 font-medium">
            Work Arrangement <span className="text-gold-500">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {WORK_ARRANGEMENTS.map((arr) => {
              const isSelected = formData.workArrangement === arr.value
              const Icon = workArrangementIcons[arr.value as keyof typeof workArrangementIcons]

              return (
                <button
                  key={arr.value}
                  type="button"
                  onClick={() => setFormData({ workArrangement: arr.value })}
                  className={cn(
                    'relative p-6 rounded-2xl border-2 text-center transition-all duration-300 overflow-hidden group',
                    isSelected
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                      : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50 hover:shadow-elevation-xs'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-gold-500" />
                    </div>
                  )}
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all',
                    isSelected 
                      ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow' 
                      : 'bg-charcoal-100 text-charcoal-500 group-hover:bg-charcoal-200'
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-gold-700' : 'text-charcoal-800'
                  )}>
                    {arr.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {formData.workArrangement === 'hybrid' && (
          <div className="p-5 bg-gradient-to-r from-charcoal-50 to-slate-50 rounded-xl border border-charcoal-100 animate-fade-in">
            <Label className="text-charcoal-700 font-medium mb-3 block">Days in Office Per Week</Label>
            <Select
              value={formData.hybridDays.toString()}
              onValueChange={(value) => setFormData({ hybridDays: parseInt(value) || 3 })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day/week</SelectItem>
                <SelectItem value="2">2 days/week</SelectItem>
                <SelectItem value="3">3 days/week</SelectItem>
                <SelectItem value="4">4 days/week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {(formData.workArrangement === 'hybrid' || formData.workArrangement === 'onsite') && (
          <div className="animate-fade-in space-y-3">
            <Label className="text-charcoal-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-charcoal-400" />
              Office Location <span className="text-gold-500">*</span>
            </Label>
            <div className="p-5 bg-gradient-to-r from-charcoal-50 to-slate-50 rounded-xl border border-charcoal-100">
              <AddressForm
                value={{
                  addressLine1: formData.locationAddressLine1,
                  addressLine2: formData.locationAddressLine2,
                  city: formData.locationCity,
                  stateProvince: formData.locationState,
                  postalCode: formData.locationPostalCode,
                  countryCode: formData.locationCountry,
                }}
                onChange={(data) =>
                  setFormData({
                    locationAddressLine1: data.addressLine1 || formData.locationAddressLine1,
                    locationAddressLine2: data.addressLine2 || formData.locationAddressLine2,
                    locationCity: data.city || formData.locationCity,
                    locationState: data.stateProvince || formData.locationState,
                    locationPostalCode: data.postalCode || formData.locationPostalCode,
                    locationCountry: data.countryCode || formData.locationCountry,
                  })
                }
                required
                showAddressLine2
                validateOnBlur
              />
            </div>
          </div>
        )}
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Authorization</span>
        </div>
      </div>

      {/* Work Authorization Section */}
      <Section icon={Shield} title="Work Authorization">
        <p className="text-sm text-charcoal-600">Select all visa types the client will consider:</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {WORK_AUTHORIZATIONS.map((auth) => {
            const isChecked = formData.workAuthorizations.includes(auth.value)
            return (
              <label
                key={auth.value}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                  isChecked
                    ? 'bg-gradient-to-r from-gold-50 to-amber-50 border-gold-400 shadow-gold-glow'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleWorkAuthorizationChange(auth.value, !!checked)
                  }
                  className={cn(
                    'border-2 transition-colors',
                    isChecked ? 'border-gold-500 data-[state=checked]:bg-gold-500' : 'border-charcoal-300'
                  )}
                />
                <span className={cn(
                  'text-sm font-medium',
                  isChecked ? 'text-gold-700' : 'text-charcoal-700'
                )}>
                  {auth.label}
                </span>
              </label>
            )
          })}
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Compensation</span>
        </div>
      </div>

      {/* Compensation Section */}
      <Section icon={DollarSign} title="Compensation (Hourly Rates)">
        <div className="p-6 bg-gradient-to-br from-charcoal-50/50 to-white border border-charcoal-100 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bill Rate */}
            <div className="space-y-4">
              <Label className="text-charcoal-700 font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Bill Rate (Client Pays)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-charcoal-500 font-medium">Min <span className="text-gold-500">*</span></span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium">$</span>
                    <Input
                      type="number"
                      value={formData.billRateMin}
                      onChange={(e) => setFormData({ billRateMin: e.target.value })}
                      placeholder="100"
                      min={0}
                      step={5}
                      className="pl-8 h-12 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-charcoal-500 font-medium">Max <span className="text-gold-500">*</span></span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium">$</span>
                    <Input
                      type="number"
                      value={formData.billRateMax}
                      onChange={(e) => setFormData({ billRateMax: e.target.value })}
                      placeholder="150"
                      min={0}
                      step={5}
                      className="pl-8 h-12 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Rate */}
            <div className="space-y-4">
              <Label className="text-charcoal-700 font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forest-500"></div>
                Pay Rate (Contractor Gets)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs text-charcoal-500 font-medium">Min</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium">$</span>
                    <Input
                      type="number"
                      value={formData.payRateMin}
                      onChange={(e) => setFormData({ payRateMin: e.target.value })}
                      placeholder="80"
                      min={0}
                      step={5}
                      className="pl-8 h-12 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-xs text-charcoal-500 font-medium">Max</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium">$</span>
                    <Input
                      type="number"
                      value={formData.payRateMax}
                      onChange={(e) => setFormData({ payRateMax: e.target.value })}
                      placeholder="120"
                      min={0}
                      step={5}
                      className="pl-8 h-12 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Indicator */}
          {margin && parseFloat(margin) > 0 && (
            <div className={cn(
              'p-4 rounded-xl text-sm flex items-center gap-3',
              parseFloat(margin) >= 20 
                ? 'bg-gradient-to-r from-forest-50 to-emerald-50 border border-forest-200' 
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
            )}>
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                parseFloat(margin) >= 20 ? 'bg-forest-100' : 'bg-amber-100'
              )}>
                <TrendingUp className={cn(
                  'w-5 h-5',
                  parseFloat(margin) >= 20 ? 'text-forest-600' : 'text-amber-600'
                )} />
              </div>
              <div>
                <span className={cn(
                  'font-semibold',
                  parseFloat(margin) >= 20 ? 'text-forest-700' : 'text-amber-700'
                )}>
                  Estimated Margin: {margin}%
                </span>
                {parseFloat(margin) < 20 && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    Target margin is 20%+ for healthy profitability
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contract-to-Hire Conversion */}
        {formData.jobType === 'contract_to_hire' && (
          <div className="p-5 border-2 border-gold-200 bg-gradient-to-br from-gold-50 to-amber-50 rounded-2xl space-y-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-gold-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Contract-to-Hire Conversion Terms
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gold-700 font-medium">Conversion Salary Min</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500">$</span>
                  <Input
                    type="number"
                    value={formData.conversionSalaryMin}
                    onChange={(e) => setFormData({ conversionSalaryMin: e.target.value })}
                    placeholder="180,000"
                    className="pl-8 h-11 rounded-xl border-gold-300 bg-white/80"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gold-700 font-medium">Conversion Salary Max</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500">$</span>
                  <Input
                    type="number"
                    value={formData.conversionSalaryMax}
                    onChange={(e) => setFormData({ conversionSalaryMax: e.target.value })}
                    placeholder="220,000"
                    className="pl-8 h-11 rounded-xl border-gold-300 bg-white/80"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gold-700 font-medium">Conversion Fee %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.conversionFee}
                    onChange={(e) => setFormData({ conversionFee: e.target.value })}
                    placeholder="20"
                    className="pr-8 h-11 rounded-xl border-gold-300 bg-white/80"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500">%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Schedule</span>
        </div>
      </div>

      {/* Schedule Section */}
      <Section icon={Clock} title="Schedule & Availability">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Weekly Hours</Label>
            <Select
              value={formData.weeklyHours}
              onValueChange={(value) => setFormData({ weeklyHours: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 hours (Part-time)</SelectItem>
                <SelectItem value="30">30 hours</SelectItem>
                <SelectItem value="40">40 hours (Full-time)</SelectItem>
                <SelectItem value="45">45 hours</SelectItem>
                <SelectItem value="50">50+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Overtime Expected</Label>
            <Select
              value={formData.overtimeExpected}
              onValueChange={(value) => setFormData({ overtimeExpected: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No overtime expected</SelectItem>
                <SelectItem value="rarely">Rarely (&lt;5 hrs/week)</SelectItem>
                <SelectItem value="occasionally">Occasionally (5-10 hrs/week)</SelectItem>
                <SelectItem value="regularly">Regularly (10+ hrs/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-r from-charcoal-50 to-slate-50 rounded-xl border border-charcoal-100 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={formData.onCallRequired}
              onCheckedChange={(checked) => setFormData({ onCallRequired: !!checked })}
              className="border-2 border-charcoal-300"
            />
            <span className="text-sm font-semibold text-charcoal-700">On-Call Rotation Required</span>
          </label>
          {formData.onCallRequired && (
            <div className="pl-7 space-y-2 animate-fade-in">
              <Label className="text-xs text-charcoal-600 font-medium">On-Call Schedule</Label>
              <Input
                value={formData.onCallSchedule}
                onChange={(e) => setFormData({ onCallSchedule: e.target.value })}
                placeholder="e.g., 1 week every 6 weeks, weekends only"
                className="h-11 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          )}
        </div>
      </Section>

      {/* Validation */}
      {(!formData.billRateMin || !formData.billRateMax) && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-start gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-800">Required: Bill Rate Range</h4>
            <p className="text-sm text-amber-700 mt-1">Please enter both minimum and maximum bill rates to continue.</p>
          </div>
        </div>
      )}
    </div>
  )
}
