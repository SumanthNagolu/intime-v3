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
import { LocationPicker } from '@/components/addresses'
import { cn } from '@/lib/utils'
import { MapPin, Shield, DollarSign, Clock, AlertCircle } from 'lucide-react'

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

  return (
    <div className="space-y-8">
      {/* Work Location Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Work Location
          </h3>
        </div>

        <div className="space-y-2">
          <Label>Work Arrangement *</Label>
          <div className="grid grid-cols-3 gap-3">
            {WORK_ARRANGEMENTS.map((arr) => (
              <button
                key={arr.value}
                type="button"
                onClick={() => setFormData({ workArrangement: arr.value })}
                className={cn(
                  'p-4 rounded-lg border-2 text-center transition-all duration-200',
                  formData.workArrangement === arr.value
                    ? 'border-gold-500 bg-gold-50 shadow-sm'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                )}
              >
                <div className="text-2xl mb-1">
                  {arr.value === 'remote' && '🏠'}
                  {arr.value === 'hybrid' && '🏢🏠'}
                  {arr.value === 'onsite' && '🏢'}
                </div>
                <span className="text-sm font-medium">{arr.label}</span>
              </button>
            ))}
          </div>
        </div>

        {formData.workArrangement === 'hybrid' && (
          <div className="space-y-2 p-4 bg-charcoal-50 rounded-lg">
            <Label>Days in Office Per Week</Label>
            <Select
              value={formData.hybridDays.toString()}
              onValueChange={(value) => setFormData({ hybridDays: parseInt(value) || 3 })}
            >
              <SelectTrigger>
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
          <LocationPicker
            label="Office Location"
            value={{
              city: formData.locationCity,
              stateProvince: formData.locationState,
              countryCode: formData.locationCountry,
            }}
            onChange={(data) =>
              setFormData({
                locationCity: data.city || '',
                locationState: data.stateProvince || '',
                locationCountry: data.countryCode || 'US',
              })
            }
            required
            showCountry
          />
        )}
      </div>

      {/* Work Authorization Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Work Authorization
          </h3>
        </div>

        <p className="text-sm text-charcoal-500">Select all visa types the client will consider:</p>

        <div className="grid grid-cols-3 gap-2">
          {WORK_AUTHORIZATIONS.map((auth) => (
            <label
              key={auth.value}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200',
                formData.workAuthorizations.includes(auth.value)
                  ? 'bg-gold-50 border-gold-500'
                  : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
              )}
            >
              <Checkbox
                checked={formData.workAuthorizations.includes(auth.value)}
                onCheckedChange={(checked) =>
                  handleWorkAuthorizationChange(auth.value, !!checked)
                }
              />
              <span className="text-sm">{auth.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Compensation Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Compensation (Hourly Rates)
          </h3>
        </div>

        <div className="p-4 border border-charcoal-200 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-charcoal-700">Bill Rate (Client Pays)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs text-charcoal-500">Min *</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      type="number"
                      value={formData.billRateMin}
                      onChange={(e) => setFormData({ billRateMin: e.target.value })}
                      placeholder="100"
                      min={0}
                      step={5}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-charcoal-500">Max *</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      type="number"
                      value={formData.billRateMax}
                      onChange={(e) => setFormData({ billRateMax: e.target.value })}
                      placeholder="150"
                      min={0}
                      step={5}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-charcoal-700">Pay Rate (Contractor Gets)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs text-charcoal-500">Min</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      type="number"
                      value={formData.payRateMin}
                      onChange={(e) => setFormData({ payRateMin: e.target.value })}
                      placeholder="80"
                      min={0}
                      step={5}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-charcoal-500">Max</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      type="number"
                      value={formData.payRateMax}
                      onChange={(e) => setFormData({ payRateMax: e.target.value })}
                      placeholder="120"
                      min={0}
                      step={5}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {margin && parseFloat(margin) > 0 && (
            <div className={cn(
              'p-3 rounded-lg text-sm',
              parseFloat(margin) >= 20 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            )}>
              <span className="font-medium">Estimated Margin: {margin}%</span>
              {parseFloat(margin) < 20 && (
                <span className="ml-2 text-amber-600">
                  (Target: 20%+)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contract-to-Hire Conversion */}
        {formData.jobType === 'contract_to_hire' && (
          <div className="p-4 border border-gold-200 bg-gold-50 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold text-gold-800">Contract-to-Hire Conversion Terms</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-gold-700">Conversion Salary Min</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500">$</span>
                  <Input
                    type="number"
                    value={formData.conversionSalaryMin}
                    onChange={(e) => setFormData({ conversionSalaryMin: e.target.value })}
                    placeholder="180,000"
                    className="pl-7 border-gold-300"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gold-700">Conversion Salary Max</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500">$</span>
                  <Input
                    type="number"
                    value={formData.conversionSalaryMax}
                    onChange={(e) => setFormData({ conversionSalaryMax: e.target.value })}
                    placeholder="220,000"
                    className="pl-7 border-gold-300"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gold-700">Conversion Fee %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.conversionFee}
                    onChange={(e) => setFormData({ conversionFee: e.target.value })}
                    placeholder="20"
                    className="pr-7 border-gold-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500">%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Schedule & Availability
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Weekly Hours</Label>
            <Select
              value={formData.weeklyHours}
              onValueChange={(value) => setFormData({ weeklyHours: value })}
            >
              <SelectTrigger>
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
            <Label>Overtime Expected</Label>
            <Select
              value={formData.overtimeExpected}
              onValueChange={(value) => setFormData({ overtimeExpected: value })}
            >
              <SelectTrigger>
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

        <div className="p-4 bg-charcoal-50 rounded-lg space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={formData.onCallRequired}
              onCheckedChange={(checked) => setFormData({ onCallRequired: !!checked })}
            />
            <span className="text-sm font-medium">On-Call Rotation Required</span>
          </label>
          {formData.onCallRequired && (
            <div className="pl-6 space-y-2">
              <Label className="text-xs text-charcoal-600">On-Call Schedule</Label>
              <Input
                value={formData.onCallSchedule}
                onChange={(e) => setFormData({ onCallSchedule: e.target.value })}
                placeholder="e.g., 1 week every 6 weeks, weekends only"
              />
            </div>
          )}
        </div>
      </div>

      {/* Validation */}
      {(!formData.billRateMin || !formData.billRateMax) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Required: Bill Rate Range</h4>
            <p className="text-sm text-amber-700">Please enter both minimum and maximum bill rates to continue.</p>
          </div>
        </div>
      )}
    </div>
  )
}
