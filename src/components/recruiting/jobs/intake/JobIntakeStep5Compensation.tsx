'use client'

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
  useCreateJobStore,
  RATE_TYPES,
  FEE_TYPES,
  BENEFITS,
  OVERTIME_OPTIONS,
} from '@/stores/create-job-store'
import { Section, FieldGroup, ChipToggle, SelectCard } from './shared'
import { DollarSign, Clock, Heart, Percent, Calculator } from 'lucide-react'

export function JobIntakeStep5Compensation() {
  const { formData, setFormData, toggleArrayItem } = useCreateJobStore()

  // Get rate suffix
  const rateSuffix = RATE_TYPES.find((r) => r.value === formData.rateType)?.suffix || '/hr'

  return (
    <div className="space-y-10">
      {/* Bill Rates */}
      <Section icon={DollarSign} title="Bill Rates" subtitle="What you charge the client">
        <FieldGroup cols={3}>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Rate Type</Label>
            <Select
              value={formData.rateType}
              onValueChange={(value) => setFormData({ rateType: value as typeof formData.rateType })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">
              Bill Rate (Min) <span className="text-gold-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                value={formData.billRateMin}
                onChange={(e) => setFormData({ billRateMin: e.target.value })}
                placeholder="0.00"
                className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">
                {rateSuffix}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">
              Bill Rate (Max) <span className="text-gold-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                value={formData.billRateMax}
                onChange={(e) => setFormData({ billRateMax: e.target.value })}
                placeholder="0.00"
                className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">
                {rateSuffix}
              </span>
            </div>
          </div>
        </FieldGroup>

        {/* Pay Rates */}
        <div className="pt-4 border-t border-charcoal-100">
          <p className="text-sm font-medium text-charcoal-700 mb-4">Pay Rates (What you pay the contractor)</p>
          <FieldGroup cols={2}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Pay Rate (Min)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                <Input
                  value={formData.payRateMin}
                  onChange={(e) => setFormData({ payRateMin: e.target.value })}
                  placeholder="0.00"
                  className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">
                  {rateSuffix}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Pay Rate (Max)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                <Input
                  value={formData.payRateMax}
                  onChange={(e) => setFormData({ payRateMax: e.target.value })}
                  placeholder="0.00"
                  className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">
                  {rateSuffix}
                </span>
              </div>
            </div>
          </FieldGroup>
        </div>
      </Section>

      {/* Contract-to-Hire Conversion (only show for C2H jobs) */}
      {formData.jobType === 'contract_to_hire' && (
        <Section icon={Calculator} title="Conversion Details" subtitle="Terms for converting to permanent">
          <FieldGroup cols={3}>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Conversion Salary (Min)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                <Input
                  value={formData.conversionSalaryMin}
                  onChange={(e) => setFormData({ conversionSalaryMin: e.target.value })}
                  placeholder="0"
                  className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">/yr</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Conversion Salary (Max)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                <Input
                  value={formData.conversionSalaryMax}
                  onChange={(e) => setFormData({ conversionSalaryMax: e.target.value })}
                  placeholder="0"
                  className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm">/yr</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-charcoal-700 font-medium">Conversion Fee (%)</Label>
              <div className="relative">
                <Input
                  value={formData.conversionFee}
                  onChange={(e) => setFormData({ conversionFee: e.target.value })}
                  placeholder="20"
                  className="h-12 pr-8 rounded-xl border-charcoal-200 bg-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400">%</span>
              </div>
            </div>
          </FieldGroup>
        </Section>
      )}

      {/* Fee Structure */}
      <Section icon={Percent} title="Fee Structure" subtitle="How you charge for this placement">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEE_TYPES.map((feeType) => (
            <SelectCard
              key={feeType.value}
              selected={formData.feeType === feeType.value}
              onClick={() => setFormData({ feeType: feeType.value })}
            >
              <p className="font-semibold text-charcoal-900">{feeType.label}</p>
              <p className="text-xs text-charcoal-500 mt-1">{feeType.description}</p>
            </SelectCard>
          ))}
        </div>

        {formData.feeType === 'percentage' && (
          <div className="space-y-2 max-w-xs animate-fade-in">
            <Label className="text-charcoal-700 font-medium">Fee Percentage</Label>
            <div className="relative">
              <Input
                value={formData.feePercentage}
                onChange={(e) => setFormData({ feePercentage: e.target.value })}
                placeholder="20"
                className="h-12 pr-8 rounded-xl border-charcoal-200 bg-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400">%</span>
            </div>
          </div>
        )}

        {formData.feeType === 'flat' && (
          <div className="space-y-2 max-w-xs animate-fade-in">
            <Label className="text-charcoal-700 font-medium">Flat Fee Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                value={formData.feeFlatAmount}
                onChange={(e) => setFormData({ feeFlatAmount: e.target.value })}
                placeholder="10,000"
                className="h-12 pl-8 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
          </div>
        )}
      </Section>

      {/* Benefits */}
      <Section icon={Heart} title="Benefits" subtitle="What benefits are included?">
        <div className="flex flex-wrap gap-2">
          {BENEFITS.map((benefit) => (
            <ChipToggle
              key={benefit.value}
              selected={formData.benefits.includes(benefit.value)}
              onClick={() => toggleArrayItem('benefits', benefit.value)}
            >
              {benefit.label}
            </ChipToggle>
          ))}
        </div>
      </Section>

      {/* Work Hours */}
      <Section icon={Clock} title="Work Hours" subtitle="Expected work schedule">
        <FieldGroup cols={3}>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Weekly Hours</Label>
            <Select
              value={formData.weeklyHours}
              onValueChange={(value) => setFormData({ weeklyHours: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
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
              onValueChange={(value) => setFormData({ overtimeExpected: value as typeof formData.overtimeExpected })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {OVERTIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-charcoal-700 font-medium">On-Call Required</Label>
              <Switch
                checked={formData.onCallRequired}
                onCheckedChange={(checked) => setFormData({ onCallRequired: checked })}
              />
            </div>
            {formData.onCallRequired && (
              <Input
                value={formData.onCallSchedule}
                onChange={(e) => setFormData({ onCallSchedule: e.target.value })}
                placeholder="e.g., Rotating weekly, 24/7 support"
                className="h-10 rounded-xl border-charcoal-200 bg-white text-sm"
              />
            )}
          </div>
        </FieldGroup>
      </Section>
    </div>
  )
}
