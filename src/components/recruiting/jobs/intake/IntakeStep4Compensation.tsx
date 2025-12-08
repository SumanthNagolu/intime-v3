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
import { cn } from '@/lib/utils'

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

  return (
    <div className="space-y-6">
      {/* Work Location Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Work Location
        </h3>

        <div className="space-y-2">
          <Label>Work Arrangement *</Label>
          <div className="grid grid-cols-3 gap-2">
            {WORK_ARRANGEMENTS.map((arr) => (
              <button
                key={arr.value}
                type="button"
                onClick={() => setFormData({ workArrangement: arr.value })}
                className={cn(
                  'p-3 rounded-lg border-2 text-sm transition-colors',
                  formData.workArrangement === arr.value
                    ? 'border-hublot-700 bg-hublot-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                {arr.label}
              </button>
            ))}
          </div>
        </div>

        {formData.workArrangement === 'hybrid' && (
          <div className="space-y-2">
            <Label>Days in Office</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={formData.hybridDays}
              onChange={(e) => setFormData({ hybridDays: parseInt(e.target.value) || 3 })}
            />
          </div>
        )}

        {(formData.workArrangement === 'hybrid' || formData.workArrangement === 'onsite') && (
          <div className="space-y-2">
            <Label>Office Location</Label>
            <Input
              value={formData.officeLocation}
              onChange={(e) => setFormData({ officeLocation: e.target.value })}
              placeholder="e.g., San Francisco, CA"
            />
          </div>
        )}
      </div>

      {/* Work Authorization Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Work Authorization
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {WORK_AUTHORIZATIONS.map((auth) => (
            <label
              key={auth.value}
              className={cn(
                'flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors',
                formData.workAuthorizations.includes(auth.value)
                  ? 'bg-hublot-50 border-hublot-700'
                  : 'border-charcoal-200 hover:border-charcoal-300'
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
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Compensation
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Bill Rate Min ($/hr) *</Label>
            <Input
              type="number"
              value={formData.billRateMin}
              onChange={(e) => setFormData({ billRateMin: e.target.value })}
              placeholder="110.00"
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-2">
            <Label>Bill Rate Max ($/hr) *</Label>
            <Input
              type="number"
              value={formData.billRateMax}
              onChange={(e) => setFormData({ billRateMax: e.target.value })}
              placeholder="140.00"
              min={0}
              step={0.01}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Pay Rate Min ($/hr)</Label>
            <Input
              type="number"
              value={formData.payRateMin}
              onChange={(e) => setFormData({ payRateMin: e.target.value })}
              placeholder="88.00"
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-2">
            <Label>Pay Rate Max ($/hr)</Label>
            <Input
              type="number"
              value={formData.payRateMax}
              onChange={(e) => setFormData({ payRateMax: e.target.value })}
              placeholder="112.00"
              min={0}
              step={0.01}
            />
          </div>
        </div>

        {formData.jobType === 'contract_to_hire' && (
          <div className="p-4 border rounded-lg space-y-4 bg-charcoal-50">
            <h4 className="text-sm font-medium">Contract-to-Hire Conversion</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Salary Min</Label>
                <Input
                  type="number"
                  value={formData.conversionSalaryMin}
                  onChange={(e) => setFormData({ conversionSalaryMin: e.target.value })}
                  placeholder="180000"
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Max</Label>
                <Input
                  type="number"
                  value={formData.conversionSalaryMax}
                  onChange={(e) => setFormData({ conversionSalaryMax: e.target.value })}
                  placeholder="220000"
                />
              </div>
              <div className="space-y-2">
                <Label>Fee %</Label>
                <Input
                  type="number"
                  value={formData.conversionFee}
                  onChange={(e) => setFormData({ conversionFee: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Schedule
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Weekly Hours</Label>
            <Input
              type="number"
              value={formData.weeklyHours}
              onChange={(e) => setFormData({ weeklyHours: e.target.value })}
              placeholder="40"
            />
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
                <SelectItem value="regularly">Yes, regularly (10+ hrs/week)</SelectItem>
                <SelectItem value="occasionally">Occasionally (5-10 hrs/week)</SelectItem>
                <SelectItem value="rarely">Rarely (&lt;5 hrs/week)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.onCallRequired}
              onCheckedChange={(checked) => setFormData({ onCallRequired: !!checked })}
            />
            <span className="text-sm font-medium">On-Call Required</span>
          </label>
          {formData.onCallRequired && (
            <Input
              value={formData.onCallSchedule}
              onChange={(e) => setFormData({ onCallSchedule: e.target.value })}
              placeholder="e.g., 1 week every 6 weeks"
              className="mt-2"
            />
          )}
        </div>
      </div>
    </div>
  )
}
